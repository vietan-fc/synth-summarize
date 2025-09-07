"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Link2, CheckCircle, Clock, Users, Star, Mic, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "@/components/Container";
import Button from "@/components/Button";
import FileDropzone from "@/components/FileDropzone";
import Kbd from "@/components/Kbd";

// FAQ Item Component
const FAQItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
      className="glass-panel rounded-xl overflow-hidden mb-4"
    >
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-ink-800/30 transition-colors focus-ring"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-ink-100">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-4"
        >
          <p className="text-ink-300 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

const Landing = () => {
  const handleFileSelect = (file: File) => {
    // TODO: Handle file and navigate to upload page with file
    console.log("File selected:", file.name);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <Container>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
                <span className="gradient-text">Summarize</span> any
                <br />
                podcast in{" "}
                <span className="relative">
                  seconds
                  <motion.div
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </h1>
              
              <p className="text-xl text-ink-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Transform hours of podcast content into actionable insights. 
                Upload audio files or paste podcast URLs to get AI-powered summaries instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link to="/upload">
                  <Button
                    variant="hero"
                    size="xl"
                    className="min-w-[200px]"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Podcast
                  </Button>
                </Link>
                
                <Link to="/upload">
                  <Button
                    variant="outline"
                    size="xl"
                    className="min-w-[200px]"
                  >
                    <Link2 className="w-5 h-5" />
                    Paste Link
                  </Button>
                </Link>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="flex flex-wrap justify-center items-center gap-4 mb-12 text-ink-400 text-sm">
                <div className="flex items-center gap-2">
                  <span>Press</span>
                  <Kbd>U</Kbd>
                  <span>to upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Press</span>
                  <Kbd>D</Kbd>
                  <span>for dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Press</span>
                  <Kbd>/</Kbd>
                  <span>to search</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-ink-400 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  No signup required
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-400" />
                  90% faster than manual notes
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-400" />
                  Trusted by 10k+ users
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Quick Upload Section */}
      <section className="py-16 border-t border-ink-800">
        <Container size="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-ink-100 mb-2">
                Try it now
              </h2>
              <p className="text-ink-400">
                Drop your audio file here to get started
              </p>
            </div>
            
            <FileDropzone
              onFileSelect={handleFileSelect}
              className="opacity-75 hover:opacity-100 transition-opacity"
            />
          </motion.div>
        </Container>
      </section>

      {/* Demo Preview */}
      <section className="py-16 border-t border-ink-800">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">
              See the magic in action
            </h2>
            <p className="text-xl text-ink-300 max-w-2xl mx-auto">
              From a 60-minute episode to a 5-minute read with key insights, 
              action items, and memorable quotes.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="glass-panel rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink-100">
                    The Tim Ferriss Show: Derek Sivers
                  </h3>
                  <p className="text-ink-400">Originally 67 minutes • Now a 4-minute read</p>
                </div>
                <div className="ml-auto">
                  <div className="bg-success/10 border border-success/20 rounded-full px-3 py-1">
                    <span className="text-success text-sm font-medium">5 min read</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-ink-100 mb-3">Key Takeaways</h4>
                  <ul className="space-y-2 text-ink-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                      Focus on systems over goals - goals have an end point, systems create lasting change
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                      The importance of saying no to preserve energy for what truly matters
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                      Building wealth through ownership and solving real problems for people
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["entrepreneurship", "systems thinking", "wealth building", "productivity"].map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-900/20 text-brand-300 border border-brand-700/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 border-t border-ink-800">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">
              How it works
            </h2>
            <p className="text-xl text-ink-300">
              Three simple steps to get your podcast summary
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Upload or Link",
                description: "Drop your audio file or paste a podcast URL from Spotify, Apple, or any RSS feed",
                icon: Upload,
              },
              {
                step: "2", 
                title: "AI Processing",
                description: "Our AI transcribes and analyzes the content to extract key insights and themes",
                icon: Clock,
              },
              {
                step: "3",
                title: "Get Summary",
                description: "Receive a structured summary with takeaways, timestamps, and shareable insights",
                icon: CheckCircle,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center mx-auto glow-brand">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-ink-800 border-2 border-brand-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-400">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-ink-100 mb-3">
                  {item.title}
                </h3>
                <p className="text-ink-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-16 border-t border-ink-800">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Loved by podcast enthusiasts
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Sarah Chen",
                role: "Product Manager",
                avatar: "SC",
                quote: "This tool has revolutionized how I consume podcasts. I can now get the key insights from 10+ episodes per week instead of struggling through 2-3.",
              },
              {
                name: "Marcus Rodriguez", 
                role: "Entrepreneur",
                avatar: "MR",
                quote: "The summaries are incredibly accurate and save me hours each week. The timestamp feature helps me jump to specific sections when I need to.",
              },
              {
                name: "Emily Watson",
                role: "Learning & Development",
                avatar: "EW", 
                quote: "Perfect for our team's learning sessions. We share podcast summaries and everyone gets the value without the time commitment.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                className="glass-panel rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-ink-300 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-ink-100">{testimonial.name}</div>
                    <div className="text-sm text-ink-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t border-ink-800">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Frequently asked questions
            </h2>
            <p className="text-xl text-ink-300">
              Everything you need to know about PodSum
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "What podcast formats do you support?",
                answer: "We support MP3, M4A, and WAV audio files up to 200MB. You can also paste URLs from Spotify, Apple Podcasts, Google Podcasts, and any RSS feed."
              },
              {
                question: "How accurate are the AI summaries?",
                answer: "Our AI models achieve 95%+ accuracy in capturing key insights. We use advanced transcription and natural language processing to identify main themes, action items, and memorable quotes."
              },
              {
                question: "Can I customize the summary format?",
                answer: "Yes! Choose from Brief (key points only), Standard (detailed insights), or Deep (comprehensive analysis). You can also toggle timestamps and adjust bullet point density."
              },
              {
                question: "Is my data secure and private?",
                answer: "Absolutely. Audio files are processed securely and deleted after 30 days. We never share your content or personal data with third parties. All summaries are private to your account."
              },
              {
                question: "Do you offer team or business plans?",
                answer: "Yes! We have team plans with shared workspaces, collaboration features, and volume discounts. Contact us for custom enterprise solutions."
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-ink-800">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold gradient-text mb-4">
              Ready to save hours every week?
            </h2>
            <p className="text-xl text-ink-300 mb-8 max-w-2xl mx-auto">
              Join thousands of others who've transformed how they consume podcast content.
            </p>
            
            <Link to="/upload">
              <Button
                variant="hero"
                size="xl"
                className="min-w-[250px]"
              >
                Start Summarizing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default Landing;