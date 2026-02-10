"use client";

export default function AboutPage() {
  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">About</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Background and interest
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">INTRO</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              I’m a Data Engineer currently working at MAQ Software, where I
              design and optimize scalable data pipelines processing over 100M+
              records daily. My work focuses on building reliable ETL systems,
              improving performance through distributed computing, and enabling
              data-driven decision-making through clean, high-quality data
              platforms.I enjoy solving complex data problems — whether it’s
              optimizing a Spark job, designing a scalable architecture, or
              building monitoring systems that ensure production reliability.
              I’m particularly interested in large-scale systems, cloud data
              engineering, and real-time data processing. Beyond work, I’m
              deeply curious about how technology shapes businesses and society.
              I enjoy continuously learning about system design, AI, analytics,
              and the evolving data ecosystem. If you're building something
              interesting in data, cloud, or analytics, I’d be happy to connect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">SOME HISTORY</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  My interest in technology started early when I first began
                  exploring computers and experimenting with basic programs. My
                  favorite game was Roadrash, NFS Most Wanted and GTA San
                  Andreas.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  My journey into tech began with a simple “Hello World,” after
                  I couldn’t clear the NEET exam during COVID. What felt like a
                  setback became the turning point of my career.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  During my engineering journey, I became particularly drawn to
                  data systems and backend architecture rather than just
                  application development.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  I completed my Bachelor of Technology in Computer Science and
                  Engineering from Lovely Professional University in 2025.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  I began my professional career as an Associate Data Engineer,
                  where I worked on SQL optimization, ETL workflows, and cloud
                  data transformations.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  Currently, as a Data Engineer, I work on distributed systems
                  using PySpark and Databricks, focusing on performance
                  optimization, incremental processing, and data quality
                  frameworks.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">FUN FACTS</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  I love the idea of traveling — even if budget and time don’t
                  always allow it, I’m always planning the next adventure.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  I speak Hindi, English, and a variety of slang “dialects”
                  depending on the vibe.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  I spend my free time watching tech vlogs and constantly
                  gathering new ideas and insights.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  I enjoy photography (and yes, selfies too — pun intended).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>
                  I’m building a DIY life — learning, experimenting, and
                  figuring things out hands-on.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">I LIKE</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Coding",
                "Travel",
                "Photography",
                "Music",
                "Dancing",
                "Coffee",
                "Reading",
                "Cricket",
                "Cooking",
              ].map((item) => (
                <div
                  key={item}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-center text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
