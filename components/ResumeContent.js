"use client";

import { useState } from "react";

export default function ResumeContent() {
  const sections = [
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "certifications", label: "Certifications" },
    { id: "education", label: "Education" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Resume</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Data Engineer focused on scalable systems, real-time pipelines, and
          AI-powered data solutions.
        </p>

        {/* Navigation Anchors */}
        <div className="mb-12 pb-8 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Jump to section
          </p>
          <div className="flex flex-wrap gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all duration-200"
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <section id="experience" className="mb-16">
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b border-gray-200 dark:border-gray-800">
            Experience
          </h2>

          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-semibold">Data Engineer I</h3>
                <span className="text-sm text-gray-500">
                  Sep 2025 — Present
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-400 font-medium mb-3">
                MAQ Software · Noida
              </p>
              <ul className="text-gray-600 dark:text-gray-500 text-sm space-y-2 leading-relaxed">
                <li>
                  Built scalable ETL pipelines using PySpark and Azure
                  Databricks processing 100M+ daily records with 35% performance
                  improvement.
                </li>
                <li>
                  Engineered ML-powered anomaly detection system monitoring 400+
                  production tables (Isolation Forest + LSTM) with 92% accuracy.
                </li>
                <li>
                  Developed automated alerting framework reducing incident
                  response time by 80% and improving SLA compliance.
                </li>
                <li>
                  Created executive Power BI dashboards for real-time KPI
                  tracking and leadership insights.
                </li>
              </ul>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-semibold">
                  Associate Data Engineer
                </h3>
                <span className="text-sm text-gray-500">
                  Sep 2024 — Aug 2025
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-400 font-medium mb-3">
                MAQ Software · Noida
              </p>
              <ul className="text-gray-600 dark:text-gray-500 text-sm space-y-2 leading-relaxed">
                <li>
                  Optimized SQL and PySpark workloads processing 50M+ rows
                  daily, achieving 60% faster query execution.
                </li>
                <li>
                  Implemented transformations using Azure Synapse Analytics and
                  ADX, improving operational efficiency by 25%.
                </li>
                <li>
                  Built automated ETL pipelines using Azure Data Factory
                  ensuring high data reliability across enterprise systems.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="mb-16">
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b border-gray-200 dark:border-gray-800">
            Selected Projects
          </h2>

          <div className="space-y-10 text-sm text-gray-600 dark:text-gray-500 leading-relaxed">
            <div>
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200 mb-2">
                Real-Time Sales Analytics Pipeline
              </h3>
              <p>
                Designed end-to-end streaming pipeline processing 10M+ daily
                sales events using Spark Streaming and Delta Lake (Medallion
                Architecture). Replaced 24-hour batch delays with real-time
                analytics and implemented event-time deduplication for financial
                accuracy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-800 dark:text-gray-200 mb-2">
                Raktdaan Kendra – Blood Donation Platform
              </h3>
              <p>
                Built full-stack geo-location based donor discovery platform
                using React, Node.js, PostgreSQL & PostGIS. Reduced search
                latency by 70% and integrated Twilio API for emergency SMS
                notifications.
              </p>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="mb-16">
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b border-gray-200 dark:border-gray-800">
            Technical Skills
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600 dark:text-gray-500">
            <div>
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Data Engineering
              </h3>
              <p>
                PySpark, Apache Spark, Delta Lake, ETL/ELT Pipelines, Data
                Modeling (Star/Snowflake), Incremental Processing, SCD
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Cloud & Big Data
              </h3>
              <p>
                Azure Databricks, Microsoft Fabric, Azure Data Factory, Synapse
                Analytics, ADLS Gen2, ADX (Kusto)
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Languages & Databases
              </h3>
              <p>Python, SQL, PostgreSQL, SQL Server, Spark SQL</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                ML & Analytics
              </h3>
              <p>
                Scikit-Learn, Anomaly Detection, Time-Series Analysis, NLP,
                Power BI (DAX, Power Query)
              </p>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="mb-16">
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b border-gray-200 dark:border-gray-800">
            Certifications
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-500 text-sm">
            <li>
              Microsoft Certified: Fabric Analytics Engineer Associate (DP-600)
            </li>
            <li>
              Microsoft Certified: Fabric Data Engineer Associate (DP-700)
            </li>
          </ul>
        </section>

        {/* Education Section */}
        <section id="education">
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b border-gray-200 dark:border-gray-800">
            Education
          </h2>
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-lg font-semibold">
                Bachelor of Technology in Computer Science & Engineering
              </h3>
              <span className="text-sm text-gray-500">2021 — 2025</span>
            </div>
            <p className="text-gray-700 dark:text-gray-400 font-medium">
              Lovely Professional University · CGPA: 7.5/10
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
