import { createActor } from "@/backend";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";

/**
 * Shared access to the backend actor plus the caller's authentication state.
 * Every query and mutation hook in the app builds on this.
 */
export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  const {
    isAuthenticated,
    isInitializing,
    login,
    clear,
    loginStatus,
    loginError,
  } = useInternetIdentity();

  return {
    actor,
    /** True while the actor is being created or the identity is restoring. */
    isActorLoading: isFetching || isInitializing,
    isAuthenticated,
    isInitializing,
    login,
    clear,
    loginStatus,
    loginError,
  };
}
