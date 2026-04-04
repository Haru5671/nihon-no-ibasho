"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppTabs from "@/components/AppTabs";
import Footer from "@/components/Footer";
import type { Topic } from "@/data/posts";

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>(undefined);

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setTimeout(() => {
      document.getElementById("hiroba")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <>
      <Header />
      <main>
        <Hero onTopicSelect={handleTopicSelect} />
        <AppTabs initialTopic={selectedTopic} />
      </main>
      <Footer />
    </>
  );
}
