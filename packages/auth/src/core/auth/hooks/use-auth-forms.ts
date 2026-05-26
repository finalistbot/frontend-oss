"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  requestEmailOTPSchema,
  updateUsernameSchema,
  verifyEmailOTPSchema,
  type RequestEmailOTPInput,
  type UpdateUsernameInput,
  type VerifyEmailOTPInput,
} from "../../../schemas/auth-schemas";
import { useAuth } from "../../providers/auth-provider";
import type { User, EmailOTPChallenge } from "../../../types/auth-types";

type FormOptions<TInput, TResult> = {
  defaultValues?: Partial<TInput>;
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
};

export function useRequestEmailOTPForm(
  options?: FormOptions<RequestEmailOTPInput, EmailOTPChallenge>,
) {
  const { requestEmailOTP } = useAuth();

  const form = useForm<RequestEmailOTPInput>({
    resolver: zodResolver(requestEmailOTPSchema),
    defaultValues: {
      email: options?.defaultValues?.email ?? "",
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await requestEmailOTP(values.email);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      options?.onError?.(error);
      throw error;
    }
  });

  return { form, submit };
}

export function useVerifyEmailOTPForm(
  options?: FormOptions<VerifyEmailOTPInput, User>,
) {
  const { verifyEmailOTP } = useAuth();

  const form = useForm<VerifyEmailOTPInput>({
    resolver: zodResolver(verifyEmailOTPSchema),
    defaultValues: {
      challenge_id: options?.defaultValues?.challenge_id ?? "",
      code: options?.defaultValues?.code ?? "",
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await verifyEmailOTP(values.challenge_id, values.code);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      options?.onError?.(error);
      throw error;
    }
  });

  return { form, submit };
}

// INFO: Check if required_username is true then we want to display this dialog/screen no matter what
export function useUpdateUsernameForm(
  options?: FormOptions<UpdateUsernameInput, User>,
) {
  const { updateUsername } = useAuth();

  const form = useForm<UpdateUsernameInput>({
    resolver: zodResolver(updateUsernameSchema),
    defaultValues: {
      username: options?.defaultValues?.username ?? "",
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await updateUsername(values.username);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      options?.onError?.(error);
      throw error;
    }
  });

  return { form, submit };
}
