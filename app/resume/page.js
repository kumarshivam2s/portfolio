import { getSettings } from "@/models/Setting";
import ResumeContent from "@/components/ResumeContent";
import FeatureDisabled from "@/components/FeatureDisabled";

export default async function ResumePage() {
  const settings = await getSettings();

  if (!settings?.showResume) {
    return (
      <FeatureDisabled
        title="Resume Disabled"
        message="The resume is currently disabled by the site administrator."
      />
    );
  }

  return <ResumeContent />;
}
