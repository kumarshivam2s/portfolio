export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center py-3 text-xs">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Kumar Shivam. All rights reserved.</p>
      </div>
    </footer>
  );
}