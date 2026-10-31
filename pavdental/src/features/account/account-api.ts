import { authFetch } from "../auth/auth-api";

export interface PaymentMethodItem {
  id: string;
  brand: "visa" | "mastercard" | "amex" | "apple_pay" | "google_pay";
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

// A parent or guardian adds a child under 16 (decisions log #17).
export type DependantRelationship = "Son" | "Daughter" | "Ward";

export interface DependantItem {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  // "Other" can still appear on profiles added before the rule.
  relationship: DependantRelationship | "Other";
  consentSigned: boolean;
}

export type NewDependant = Omit<DependantItem, "id" | "relationship"> & { relationship: DependantRelationship };

export const accountApi = {
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await authFetch("/api/auth/account/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update password");
    }
    return res.json();
  },

  deleteAccount: async (
    reason?: string,
    confirmPassword?: string
  ): Promise<{ success: boolean; message?: string; dueBy?: string }> => {
    const res = await authFetch("/api/auth/account", {
      method: "DELETE",
      body: JSON.stringify({ reason, confirmPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // code is "UPCOMING_BOOKINGS" when appointments must be cancelled first.
      throw Object.assign(new Error(err.error || "Failed to close the account"), { code: err.code as string | undefined });
    }
    return res.json();
  },

  resendVerificationEmail: async (): Promise<{ success: boolean; message: string }> => {
    const res = await authFetch("/api/auth/account/verify-email/resend", {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to send verification email");
    }
    return res.json();
  },

  getPaymentMethods: async (): Promise<PaymentMethodItem[]> => {
    const res = await authFetch("/api/payments/methods");
    if (!res.ok) {
      throw new Error("Failed to load payment methods");
    }
    return res.json();
  },

  addPaymentMethod: async (
    card: Omit<PaymentMethodItem, "id" | "isDefault">
  ): Promise<PaymentMethodItem> => {
    const paymentMethodId = `pm_${card.brand}_${card.last4}_${Date.now()}`;
    await accountApi.attachPaymentMethod(paymentMethodId);
    const methods = await accountApi.getPaymentMethods();
    return (
      methods.find((m) => m.id === paymentMethodId) || {
        id: paymentMethodId,
        ...card,
        isDefault: methods.length <= 1,
      }
    );
  },

  removePaymentMethod: async (id: string): Promise<void> => {
    const res = await authFetch(`/api/payments/methods/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 404) return;
    const err: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to remove payment method");
  },

  setDefaultPaymentMethod: async (id: string): Promise<void> => {
    const res = await authFetch(`/api/payments/methods/${id}/default`, { method: "PATCH" });
    if (res.ok) return;
    const err: { error?: string } = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed to set default");
  },

  createSetupIntent: async (): Promise<{ clientSecret: string; isMock?: boolean }> => {
    const res = await authFetch("/api/payments/setup-intent", { method: "POST" });
    if (!res.ok) {
      const err: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Failed to create setup intent");
    }
    return res.json();
  },

  attachPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    const res = await authFetch("/api/payments/methods/attach", {
      method: "POST",
      body: JSON.stringify({ paymentMethodId }),
    });
    if (!res.ok) {
      const err: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Failed to save payment method");
    }
  },

  getDependants: async (): Promise<DependantItem[]> => {
    const res = await authFetch("/api/patients/dependants");
    if (!res.ok) {
      throw new Error("Failed to load dependants");
    }
    return res.json();
  },

  addDependant: async (dependant: NewDependant): Promise<DependantItem> => {
    const res = await authFetch("/api/patients/dependants", {
      method: "POST",
      body: JSON.stringify(dependant),
    });
    if (!res.ok) {
      const err: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Failed to add dependant");
    }
    return res.json();
  },

  updateDependant: async (id: string, updates: Partial<NewDependant>): Promise<DependantItem> => {
    const res = await authFetch(`/api/patients/dependants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Failed to update dependant");
    }
    return res.json();
  },

  removeDependant: async (id: string): Promise<void> => {
    const res = await authFetch(`/api/patients/dependants/${id}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 404) {
      const err: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Failed to remove dependant");
    }
  },
};
