import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { ThemedText, Card, Badge, Button, Input, EmptyState } from "@/components";
import {
  useDependants,
  useAddDependantMutation,
  useUpdateDependantMutation,
  useRemoveDependantMutation,
} from "@/features/account/account-hooks";
import type { DependantItem, DependantRelationship } from "@/features/account/account-api";
import { changedDependantFields } from "@/features/account/dependant-edits";
import { colors, spacing, type, radius } from "@/theme";

// Only a parent or guardian adds a child under 16 (decisions log #17).
const RELATIONSHIPS: DependantRelationship[] = ["Son", "Daughter", "Ward"];

export default function DependantsScreen() {
  const { data: dependants = [] } = useDependants();
  const addDependant = useAddDependantMutation();
  const updateDependant = useUpdateDependantMutation();
  const removeDependant = useRemoveDependantMutation();

  const [modalVisible, setModalVisible] = useState(false);
  // The dependant being edited, or null when adding a new one.
  const [editing, setEditing] = useState<DependantItem | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  // "Other" only for older profiles being edited; it can't be picked.
  const [relationship, setRelationship] = useState<DependantRelationship | "Other">("Son");
  const [isGuardian, setIsGuardian] = useState(false);

  const resetForm = () => {
    setEditing(null);
    setFirstName("");
    setLastName("");
    setDob("");
    setRelationship("Son");
    setIsGuardian(false);
  };

  const openAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (dep: DependantItem) => {
    setEditing(dep);
    setFirstName(dep.firstName);
    setLastName(dep.lastName);
    setDob(String(dep.dob).slice(0, 10));
    setRelationship(dep.relationship);
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!firstName.trim() || !lastName.trim() || !dob.trim()) {
      Alert.alert("Missing Fields", "Please complete all required fields for your child/dependant.");
      return;
    }
    const updates = changedDependantFields(editing, { firstName, lastName, dob, relationship });

    if (Object.keys(updates).length === 0) {
      setModalVisible(false);
      resetForm();
      return;
    }

    try {
      await updateDependant.mutateAsync({ id: editing.id, updates });
      setModalVisible(false);
      resetForm();
      Alert.alert("Profile Updated", `${firstName.trim()}'s details have been saved.`);
    } catch (err: unknown) {
      // The server explains age refusals in plain words.
      Alert.alert(
        "Could not save changes",
        err instanceof Error && err.message ? err.message : "Could not update the dependant profile."
      );
    }
  };

  const handleAdd = async () => {
    if (!firstName || !lastName || !dob) {
      Alert.alert("Missing Fields", "Please complete all required fields for your child/dependant.");
      return;
    }
    if (!isGuardian) {
      Alert.alert("Confirm parental responsibility", "Confirm you are this child's parent or legal guardian.");
      return;
    }
    if (relationship === "Other") {
      Alert.alert("Missing Fields", "Please choose the child's relationship to you.");
      return;
    }

    try {
      await addDependant.mutateAsync({
        firstName,
        lastName,
        dob,
        relationship,
        consentSigned: true,
      });

      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // optional
      }

      setModalVisible(false);
      resetForm();
      Alert.alert("Child Profile Linked", `${firstName}'s profile has been linked to your account.`);
    } catch (err: any) {
      // The server explains age and guardian refusals in plain words.
      Alert.alert("Could not add child", err?.message || "Could not link dependant profile.");
    }
  };

  const handleRemove = (id: string, name: string) => {
    Alert.alert("Unlink Dependant?", `Are you sure you want to unlink ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unlink",
        style: "destructive",
        onPress: async () => {
          try {
            await removeDependant.mutateAsync(id);
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              // optional
            }
          } catch {
            Alert.alert("Error", "Could not unlink profile.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <ThemedText variant="subhead" style={styles.headerSub}>
          Family & dependant accounts
        </ThemedText>
        <ThemedText variant="caption" style={styles.headerDesc}>
          Manage linked dental appointments and pediatric records for children under 16 where you hold legal parental responsibility.
        </ThemedText>
      </View>

      <View style={styles.list}>
        {dependants.length === 0 ? (
          <EmptyState
            heading="No linked dependants"
            body="Add children under 16 where you hold legal parental responsibility to manage their bookings and pediatric records."
            actionLabel="Add child / dependant"
            onAction={openAdd}
            icon="profile"
          />
        ) : (
          dependants.map((dep) => {
            const age = Math.floor(
              (Date.now() - new Date(dep.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
            );

            return (
              <Card key={dep.id} style={styles.depCard}>
                <View style={styles.depTop}>
                  <View style={styles.avatarCircle}>
                    <ThemedText variant="headline" style={styles.avatarInitial}>{dep.firstName[0]}</ThemedText>
                  </View>
                  <View style={styles.depInfo}>
                    <View style={styles.nameRow}>
                      <ThemedText variant="headline">{`${dep.firstName} ${dep.lastName}`}</ThemedText>
                      <Badge variant="info" label={`${dep.relationship} · Age ${age}`} />
                    </View>
                    <ThemedText variant="caption" style={styles.dobText}>
                      Date of Birth: {new Date(dep.dob).toLocaleDateString("en-GB")}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.depBottom}>
                  <View style={styles.consentBadge}>
                    <ThemedText
                      variant="caption"
                      style={[styles.consentText, { color: dep.consentSigned ? colors.success : colors.warning }]}
                    >
                      {dep.consentSigned ? "Parental consent active" : "Consent pending"}
                    </ThemedText>
                  </View>

                  <View style={styles.depActions}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${dep.firstName}'s details`}
                      onPress={() => openEdit(dep)}
                    >
                      <ThemedText variant="caption" style={styles.editText}>
                        Edit
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Unlink ${dep.firstName}`} onPress={() => handleRemove(dep.id, dep.firstName)}>
                      <ThemedText variant="caption" style={styles.unlinkText}>
                        Unlink
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </View>

      {dependants.length > 0 ? (
        <Button
          title="+ Add child / dependant profile"
          variant="secondary"
          onPress={openAdd}
        />
      ) : null}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText variant="headline">{editing ? "Edit child profile" : "Add child profile"}</ThemedText>
            <Button
              title="Close"
              variant="ghost"
              size="sm"
              onPress={() => setModalVisible(false)}
            />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Input
              label="Child's first name *"
              placeholder="e.g. Leo"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Input
              label="Child's last name *"
              placeholder="e.g. Jenkins"
              value={lastName}
              onChangeText={setLastName}
            />

            <Input
              label="Date of birth (YYYY-MM-DD) *"
              placeholder="e.g. 2018-06-15"
              value={dob}
              onChangeText={setDob}
            />

            <View style={styles.relSection}>
              <ThemedText variant="subhead" style={styles.relLabel}>
                Relationship *
              </ThemedText>
              <View style={styles.relPills}>
                {RELATIONSHIPS.map((r) => (
                  <TouchableOpacity accessibilityRole="radio" accessibilityLabel={r} accessibilityState={{ selected: relationship === r }}
                    key={r}
                    onPress={() => setRelationship(r)}
                    style={[styles.relPill, relationship === r && styles.relPillActive]}
                  >
                    <ThemedText
                      variant="caption"
                      style={[styles.relPillText, relationship === r && styles.relPillTextActive]}
                    >
                      {r}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {editing ? null : (
            <TouchableOpacity accessibilityLabel="I am this child's parent or legal guardian"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isGuardian }}
              onPress={() => setIsGuardian((v) => !v)}
              style={styles.guardianRow}
            >
              <View style={[styles.checkbox, isGuardian && styles.checkboxChecked]}>
                {isGuardian && <ThemedText style={styles.checkmark}>✓</ThemedText>}
              </View>
              <ThemedText variant="caption" style={styles.guardianText}>
                I am this child's parent or legal guardian. Children must be under 16; young people aged 16 or over
                can create their own account.
              </ThemedText>
            </TouchableOpacity>
            )}

            {editing ? (
              <Button
                title={updateDependant.isPending ? "Saving..." : "Save changes"}
                onPress={handleSaveEdit}
                disabled={updateDependant.isPending || !firstName || !lastName || !dob}
                loading={updateDependant.isPending}
              />
            ) : (
              <Button
                title={addDependant.isPending ? "Linking..." : "Link profile"}
                onPress={handleAdd}
                disabled={addDependant.isPending || !firstName || !lastName || !isGuardian}
                loading={addDependant.isPending}
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarCircle: {
    alignItems: "center",
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.full,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarInitial: {
    color: colors.ink,
  },
  consentBadge: {},
  depActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  editText: {
    color: colors.ink,
    fontWeight: "600",
  },
  consentText: {
    fontWeight: "600",
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
  depBottom: {
    alignItems: "center",
    borderTopColor: colors.separator,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
  },
  depCard: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.md,
  },
  depInfo: {
    flex: 1,
    gap: 2,
  },
  depTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dobText: {
    color: colors.secondaryLabel,
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
  list: {
    gap: spacing.sm,
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
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  relLabel: {
    color: colors.label,
    fontWeight: "600",
  },
  relPill: {
    backgroundColor: colors.systemBackground,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  relPillActive: {
    backgroundColor: colors.accent,
  },
  relPillText: {
    color: colors.secondaryLabel,
  },
  relPillTextActive: {
    color: colors.onAccent,
    fontWeight: "700",
  },
  relPills: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  checkbox: {
    alignItems: "center",
    borderColor: colors.separator,
    borderRadius: radius.xs,
    borderWidth: 1,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  checkmark: {
    color: colors.onInk,
    fontSize: 14,
  },
  guardianRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  guardianText: {
    color: colors.secondaryLabel,
    flex: 1,
  },
  relSection: {
    gap: spacing.xs,
  },
  unlinkText: {
    color: colors.danger,
    fontWeight: "500",
  },
});

