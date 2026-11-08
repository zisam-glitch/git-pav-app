import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { CardField, useStripe, CardFieldInput } from "@stripe/stripe-react-native";
import { ThemedText, Card, Badge, Button, AppIcon, ErrorState, Skeleton, EmptyState } from "@/components";
import {
  usePaymentMethods,
  useRemovePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
} from "@/features/account/account-hooks";
import { accountApi } from "@/features/account/account-api";
import { colors, spacing, type, radius } from "@/theme";
import { TouchableOpacity } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

export default function PaymentMethodsScreen() {
  const { data: paymentMethodsData, isLoading, isError, refetch } = usePaymentMethods();
  const paymentMethods = paymentMethodsData ?? [];
  const removeMethod = useRemovePaymentMethodMutation();
  const setDefault = useSetDefaultPaymentMethodMutation();
  const { confirmSetupIntent } = useStripe();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);
  const [cardHolder, setCardHolder] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCard = async () => {
    if (!cardDetails?.complete) {
      Alert.alert("Incomplete Card", "Please enter all card details.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Ask the server for a SetupIntent client secret
      const { clientSecret, isMock } = await accountApi.createSetupIntent();

      // Local development runs Stripe in mock mode, which can't save a card:
      // say so rather than handing Stripe a secret it can't open.
      if (isMock) {
        Alert.alert(
          "Not available in test mode",
          "This server is running without Stripe keys, so cards can't be saved. Add Stripe test keys to the backend to try it."
        );
        setIsSaving(false);
        return;
      }

      // 2. Let Stripe tokenise the card — raw PAN never leaves the SDK
      const { setupIntent, error } = await confirmSetupIntent(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: cardHolder ? { name: cardHolder } : undefined,
        },
      });

      if (error) {
        Alert.alert("Card Error", error.message);
        setIsSaving(false);
        return;
      }

      // 3. Tell our server to store the resulting paymentMethodId. Without one
      // nothing was saved, so don't say it was.
      if (!setupIntent?.paymentMethodId) {
        throw new Error("Your card wasn't saved. Please try again.");
      }
      await accountApi.attachPaymentMethod(setupIntent.paymentMethodId);
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // optional
      }

      setModalVisible(false);
      setCardDetails(null);
      setCardHolder("");
      Alert.alert("Card Added", "Your payment method has been saved securely.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not save payment card.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = (id: string, isDefault: boolean) => {
    if (isDefault && paymentMethods.length > 1) {
      Alert.alert("Cannot Remove Default", "Please set another payment method as default before removing this one.");
      return;
    }

    Alert.alert("Remove Payment Method?", "Are you sure you want to remove this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await removeMethod.mutateAsync(id);
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              // optional
            }
          } catch {
            Alert.alert("Error", "Failed to remove payment card.");
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault.mutateAsync(id);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // optional
      }
    } catch {
      Alert.alert("Error", "Could not update default card.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Skeleton height={76} />
          <Skeleton height={76} />
        </View>
      </View>
    );
  }

  if (isError && paymentMethodsData === undefined) {
    return (
      <View style={styles.container}>
        <ErrorState
          message="We couldn't load your saved cards. Check your connection and try again."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <ThemedText variant="subhead" style={styles.headerSub}>
          Saved payment methods
        </ThemedText>
        <ThemedText variant="caption" style={styles.headerDesc}>
          Your saved cards appear when you pay a deposit, so you can pick one instead of typing it in. You can also tick "save card" while paying. Payments are handled by Stripe.
        </ThemedText>
      </View>

      <View style={styles.cardsList}>
        {paymentMethods.length === 0 ? (
          <EmptyState
            illustration="payments"
            heading="No payment methods saved"
            body="Save a payment card for faster deposit checkout, or add one during your next booking."
            actionLabel="Add payment card"
            onAction={() => setModalVisible(true)}
            icon="creditCard"
          />
        ) : (
          paymentMethods.map((pm) => (
            <Card key={pm.id} style={styles.paymentCard}>
              <View style={styles.cardTop}>
                <View style={styles.brandRow}>
                  <View style={styles.brandIconWrap}>
                    <AppIcon name="creditCard" size={20} color={colors.ink} />
                  </View>
                  <View>
                    <ThemedText variant="headline" style={styles.cardName}>
                      {pm.brand.toUpperCase()} •••• {pm.last4}
                    </ThemedText>
                    <ThemedText variant="caption" style={styles.cardExp}>
                      Expires {String(pm.expMonth).padStart(2, "0")}/{pm.expYear}
                    </ThemedText>
                  </View>
                </View>

                {pm.isDefault ? (
                  <Badge variant="success" label="Default" />
                ) : (
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Make this card the default" onPress={() => handleSetDefault(pm.id)}>
                    <ThemedText variant="caption" style={styles.setDefaultText}>
                      Make Default
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.cardBottom}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Remove card" onPress={() => handleRemove(pm.id, pm.isDefault)}>
                  <ThemedText variant="caption" style={styles.deleteText}>
                    Remove Card
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </View>

      {paymentMethods.length > 0 ? (
        <Button
          title="Add payment method"
          icon={<AppIcon name="plus" size={18} color={colors.ink} />}
          variant="secondary"
          onPress={() => setModalVisible(true)}
        />
      ) : null}

      {/* Add Card Modal — Stripe CardField */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText variant="headline">Add card</ThemedText>
            <Button
              title="Close"
              variant="ghost"
              size="sm"
              onPress={() => setModalVisible(false)}
            />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <ThemedText variant="caption" style={styles.stripeNote}>
              Your card details are encrypted and tokenised by Stripe. Pav Dental never sees your card number.
            </ThemedText>

            {/* Stripe native card input — PCI-compliant */}
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: "4242 4242 4242 4242" }}
              cardStyle={{
                backgroundColor: colors.secondaryBackground as string,
                textColor: colors.label as string,
                placeholderColor: colors.secondaryLabel as string,
                borderColor: colors.separator as string,
                borderWidth: 1,
                borderRadius: 10,
              }}
              style={styles.cardField}
              onCardChange={(details) => setCardDetails(details)}
            />

            <Button
              title={isSaving ? "Saving card..." : "Save card securely"}
              onPress={handleAddCard}
              disabled={isSaving || !cardDetails?.complete}
              loading={isSaving}
            />
          </ScrollView>

          {isSaving && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.ink} />
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  brandIconWrap: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  cardBottom: {
    borderTopColor: colors.separator,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: spacing.xs,
  },
  cardExp: {
    color: colors.secondaryLabel,
  },
  cardField: {
    height: 50,
    marginVertical: spacing.xs,
    width: "100%",
  },
  cardName: {
    color: colors.label,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardsList: {
    gap: spacing.sm,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: "500",
  },
  headerBox: {
    gap: spacing.xs,
  },
  headerDesc: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
  headerSub: {
    ...type.overline,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: colors.background,
    flex: 1,
  },
  modalContent: {
    gap: spacing.lg,
    padding: spacing.md,
  },
  modalHeader: {
    alignItems: "center",
    borderBottomColor: colors.separator,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  paymentCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.md,
  },
  setDefaultText: {
    color: colors.ink,
    fontWeight: "600",
  },
  stripeNote: {
    color: colors.secondaryLabel,
    lineHeight: 18,
  },
});
