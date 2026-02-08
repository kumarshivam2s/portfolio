export default function FeatureDisabled({
  title = "Feature Disabled",
  message = "This feature is currently disabled by the site administrator.",
}) {
  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-16 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}
