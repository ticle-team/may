import {createShapleClient} from "@shaple/auth-helpers-shared";
import {createClientComponentClient} from "@shaple/auth-helpers-nextjs";

export const shapleClient = createClientComponentClient({
    shapleUrl: process.env.NEXT_PUBLIC_SHAPLE_URL,
    shapleKey: process.env.NEXT_PUBLIC_SHAPLE_ANON_KEY,
  }
);
