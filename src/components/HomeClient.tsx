"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppTabs from "@/components/AppTabs";
import Footer from "@/components/Footer";
import HomeFaq from "@/components/HomeFaq";
import type { Topic } from "@/data/posts";
import type { DbPost } from "@/lib/posts";

export default function HomeClient({ initialPosts }: { initialPosts: DbPost[] }) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // ?q= 付きでアクセスされたら検索状態に反映（構造化データのSearchAction用）
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setSearchQuery(q);
      setTimeout(() => document.getElementById("hiroba")?.scrollIntoView({ behavior: "smooth" }), 150);
    }
  }, []);

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
          initialPosts={initialPosts}
          initialTopic={selectedTopic}
          searchQuery={searchQuery}
          onTopicSelect={handleTopicSelect}
          onTopicClear={handleTopicClear}
        />
        <HomeFaq />
      </main>
      <Footer />
    </>
  );
}
