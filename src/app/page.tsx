"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppTabs from "@/components/AppTabs";
import Footer from "@/components/Footer";
import type { Topic } from "@/data/posts";

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setTimeout(() => {
      document.getElementById("hiroba")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleTopicClear = () => setSelectedTopic(undefined);

  const handlePosted = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setTimeout(() => {
      document.getElementById("hiroba")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, []);

  return (
    <>
      <Header
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onTopicSelect={handleTopicSelect}
      />
      <main>
        <Hero onPosted={handlePosted} />
        <AppTabs
          key={refreshKey}
          initialTopic={selectedTopic}
          searchQuery={searchQuery}
          onTopicSelect={handleTopicSelect}
          onTopicClear={handleTopicClear}
        />
      </main>
      <Footer />
    </>
  );
}
