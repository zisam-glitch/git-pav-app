import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi, PaymentMethodItem, NewDependant } from "./account-api";
import { useAuthStore } from "../auth/auth-store";
import { tokenStore } from "@/lib/token-store";
import { queryKeys } from "@/lib/query-keys";
import { type ConsentHistoryEntry, sortHistory } from "./consents";
import { requestDataAccessExport } from "../records/records-api";

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      return accountApi.changePassword(currentPassword, newPassword);
    },
  });
}

export function useDeleteAccountMutation() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async (params?: { reason?: string; confirmPassword?: string }) => {
      return accountApi.deleteAccount(params?.reason, params?.confirmPassword);
    },
    onSuccess: async () => {
      await tokenStore.deleteRefreshToken();
      clearAuth();
    },
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: async () => {
      return accountApi.resendVerificationEmail();
    },
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: accountApi.getPaymentMethods,
  });
}

export function useAddPaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (card: Omit<PaymentMethodItem, "id" | "isDefault">) =>
      accountApi.addPaymentMethod(card),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useRemovePaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountApi.removePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useSetDefaultPaymentMethodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountApi.setDefaultPaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useDependants() {
  return useQuery({
    queryKey: ["patient-dependants"],
    queryFn: accountApi.getDependants,
  });
}

export function useAddDependantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewDependant) => accountApi.addDependant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-dependants"] });
    },
  });
}

export function useUpdateDependantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NewDependant> }) =>
      accountApi.updateDependant(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-dependants"] });
    },
  });
}

export function useRemoveDependantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountApi.removeDependant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-dependants"] });
    },
  });
}

export function useCurrentConsents() {
  return useQuery({
    queryKey: queryKeys.consents.current(),
    queryFn: accountApi.getCurrentConsents,
  });
}

export function useConsentHistory(includeWithdrawn = true) {
  return useQuery({
    queryKey: queryKeys.consents.history(includeWithdrawn),
    queryFn: async (): Promise<ConsentHistoryEntry[]> => {
      const data = await accountApi.getConsentHistory(includeWithdrawn);
      return sortHistory(data);
    },
  });
}

export function useToggleMarketingConsentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (grant: boolean) =>
      grant
        ? accountApi.grantConsent({ consentType: "marketing", lawfulBasis: "consent" })
        : accountApi.withdrawConsent({ consentType: "marketing" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consents.all() });
    },
  });
}

export function useExportDataAccessMutation() {
  return useMutation({
    mutationFn: (params: { reason?: string; format?: "json" | "csv" }) =>
      requestDataAccessExport(params),
  });
}

export function useCompleteOnboardingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profileId,
      profile,
      grants,
    }: {
      profileId: string;
      profile: Record<string, unknown>;
      grants: Array<{ consentType: string; lawfulBasis: string }>;
    }) => {
      await accountApi.updateOnboardingProfile(profileId, profile);
      for (const grant of grants) {
        await accountApi.grantConsent(grant);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.consents.all() });
    },
  });
}

