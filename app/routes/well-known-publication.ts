import { createWellKnownLoader } from "@scribe-atp/react-router-framework";
import { SITE_AUTHOR, SITE_SLUG } from "~/config";

export const loader = createWellKnownLoader(SITE_AUTHOR, SITE_SLUG);
