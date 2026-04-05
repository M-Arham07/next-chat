import type { Profile } from "#/shared/schema/profiles/profile.ts";
import "socket.io";

declare module "socket.io" {
  interface Socket {
    profile: Profile
  }
}
