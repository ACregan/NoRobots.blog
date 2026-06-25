import { createWellKnownLoader } from "@scribe-atp/react-router-framework";
import { SITE_AUTHOR, SITE_URL } from "~/config";

export const loader = createWellKnownLoader(SITE_AUTHOR, SITE_URL);
