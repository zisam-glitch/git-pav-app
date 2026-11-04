import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { colors, type } from "@/theme";
import { AppIcon, ThemedText, type AppIconName } from "@/components";

// ─── Patient tab shell — 5 destinations ───────────────────────────────────────
// Reference tab bar: flat light grey, no top border, filled glyphs. The active
// tab is black and its label turns semibold, so state is never colour-only.

function TabIcon({ name, focused }: { name: AppIconName; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <AppIcon
        name={name}
        size={24}
        color={focused ? colors.ink : colors.tertiaryLabel}
        variant={focused ? "Bold" : "Linear"}
      />
    </View>
  );
}

function tabLabel(text: string) {
  function TabLabel({ focused }: { focused: boolean }) {
    return (
      <ThemedText
        variant="micro"
        style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelIdle]}
      >
        {text}
      </ThemedText>
    );
  }
  return TabLabel;
}

export default function PatientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleAlign: "left",
        headerTitleStyle: {
          ...type.largeTitle,
        },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.tertiaryLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          // Home draws its own top bar (avatar, perks, notifications), as in the reference
          headerShown: false,
          tabBarLabel: tabLabel("Home"),
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          tabBarLabel: tabLabel("Bookings"),
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: "Dental records",
          tabBarLabel: tabLabel("Records"),
          tabBarIcon: ({ focused }) => <TabIcon name="records" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarLabel: tabLabel("Messages"),
          tabBarIcon: ({ focused }) => <TabIcon name="message" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile & settings",
          tabBarLabel: tabLabel("Profile"),
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
    minWidth: 44,
  },
  tabLabel: {
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.ink,
    fontWeight: "600",
  },
  tabLabelIdle: {
    // One step darker than the idle icon so the label keeps AA contrast
    color: colors.secondaryLabel,
  },
});
