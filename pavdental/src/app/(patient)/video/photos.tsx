import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { pickTriagePhoto } from '@/features/video/pick-photo';
import { ThemedText, Button, AppIcon } from '@/components';
import { colors, spacing, radius } from '@/theme';

interface PhotoSlot {
  id: string;
  label: string;
  description: string;
  isCaptured: boolean;
  uri?: string;
  mimeType?: string;
}

export default function IntraoralPhotosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    appointmentId?: string;
    symptomText?: string;
    painLevel?: string;
    hasSwelling?: string;
    duration?: string;
  }>();

  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>([
    {
      id: 'front',
      label: '1. Front Teeth (Bite Closed)',
      description: 'Smile showing front top and bottom teeth together.',
      isCaptured: false,
    },
    {
      id: 'affected',
      label: '2. Affected Area / Pain Area',
      description: 'Close-up photo of the hurting tooth, filling or gum.',
      isCaptured: false,
    },
    {
      id: 'upper',
      label: '3. Upper Arch (Roof of Mouth)',
      description: 'Tilt head back, mouth open wide showing top teeth.',
      isCaptured: false,
    },
    {
      id: 'lower',
      label: '4. Lower Arch (Floor of Mouth)',
      description: 'Tilt chin down, tongue relaxed behind front teeth.',
      isCaptured: false,
    },
  ]);

  const toggleCapture = async (id: string) => {
    const photo = await pickTriagePhoto();
    if (!photo) return;
    setPhotoSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, isCaptured: true, uri: photo.uri, mimeType: photo.mimeType } : slot
      )
    );
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(patient)/video/photo-review' as any,
      params: {
        appointmentId: params.appointmentId || '',
        symptomText: params.symptomText || '',
        painLevel: params.painLevel ?? '',
        hasSwelling: params.hasSwelling || 'false',
        duration: params.duration || '',
        photos: JSON.stringify(
          Object.fromEntries(
            photoSlots
              .filter((slot) => slot.uri)
              .map((slot) => [slot.id, { uri: slot.uri, mimeType: slot.mimeType }])
          )
        ),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText variant="headline" style={styles.title}>
            Guided dental photos
          </ThemedText>
          <ThemedText variant="caption" style={styles.subtitle}>
            Clear photos help your dentist understand the problem before your video call.
          </ThemedText>
        </View>

        {/* Tip Banner */}
        <View style={styles.tipBox}>
          <ThemedText variant="caption" style={styles.tipText}>
            <ThemedText variant="caption" style={styles.tipBold}>
              Tip:
            </ThemedText>{' '}
            Use your smartphone's camera flash or stand near natural window light.
          </ThemedText>
        </View>

        {/* Photo Slots */}
        <View style={styles.slotList}>
          {photoSlots.map((slot) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={slot.label}
              accessibilityState={{ checked: slot.isCaptured }}
              key={slot.id}
              onPress={() => toggleCapture(slot.id)}
              style={[styles.slotCard, slot.isCaptured && styles.slotCardCaptured]}
            >
              <View style={styles.thumbnailBox}>
                {slot.uri ? (
                  <Image source={{ uri: slot.uri }} style={styles.thumbnailImage} contentFit="cover" accessible={false} />
                ) : (
                  <AppIcon name="plus" size={22} color={colors.ink} />
                )}
              </View>
              <View style={styles.slotInfo}>
                <ThemedText variant="headline" style={styles.slotLabel}>
                  {slot.label}
                </ThemedText>
                <ThemedText variant="caption" style={styles.slotDesc}>
                  {slot.description}
                </ThemedText>
              </View>
              <View style={styles.statusBox}>
                <ThemedText
                  variant="caption"
                  style={slot.isCaptured ? styles.statusDone : styles.statusPending}
                >
                  {slot.isCaptured ? 'Change' : 'Tap to add'}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <Button title="Review photos" arrow size="lg" onPress={handleContinue} />
        <Button
          title="Continue without photos"
          variant="ghost"
          size="sm"
          onPress={() => {
            setPhotoSlots((prev) =>
              prev.map((slot) => ({ ...slot, isCaptured: false, uri: undefined }))
            );
            router.push({
              pathname: '/(patient)/video/photo-review' as any,
              params: { ...params, photos: '{}' },
            });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  footer: {
    backgroundColor: colors.background,
    gap: spacing.xs,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
  },
  header: {
    gap: spacing.xxs,
  },
  slotCard: {
    alignItems: 'center',
    backgroundColor: colors.systemBackground,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  slotCardCaptured: {
    backgroundColor: colors.inkSubtle,
    borderColor: colors.ink,
  },
  slotDesc: {
    color: colors.secondaryLabel,
    lineHeight: 16,
  },
  slotInfo: {
    flex: 1,
    gap: 2,
  },
  slotLabel: {
    color: colors.label,
  },
  slotList: {
    gap: spacing.sm,
  },
  statusBox: {
    alignItems: 'flex-end',
  },
  statusDone: {
    color: colors.ink,
    fontWeight: '700',
  },
  statusPending: {
    color: colors.secondaryLabel,
  },
  subtitle: {
    color: colors.secondaryLabel,
  },
  thumbnailBox: {
    alignItems: 'center',
    backgroundColor: colors.inkSubtle,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  thumbnailImage: {
    height: 48,
    width: 48,
  },
  tipBold: {
    color: colors.info,
    fontWeight: '700',
  },
  tipBox: {
    backgroundColor: colors.infoSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  tipText: {
    color: colors.info,
  },
  title: {
    color: colors.label,
  },
});
