import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/button';
import { AppIcon } from '@/components/app-icon';
import { colors } from '@/theme';
import { useAppLockStore } from './app-lock-store';

export function AppLockScreen() {
  const { isLocked, unlock } = useAppLockStore();

  const handleUnlock = async () => {
    const success = await unlock();
    if (!success) {
      // Authentication failed - user can try again
    }
  };

  if (!isLocked) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppIcon name="lock" size={48} color={colors.alwaysWhite} />
        <ThemedText variant="title" style={styles.title}>
          App Locked
        </ThemedText>
        <ThemedText variant="subhead" style={styles.message}>
          Authenticate to access your health data
        </ThemedText>
        <Button 
          title="Unlock" 
          onPress={handleUnlock}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  title: {
    color: colors.alwaysWhite,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: colors.alwaysWhite,
    marginBottom: 32,
    opacity: 0.7,
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});
