'use client'

import React from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Accordion, AccordionTab } from 'primereact/accordion'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-indigo-200">
      <main className="flex-grow container mx-auto px-4 py-4">
        <section className="mb-4">
          <Card className="shadow-lg">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 pr-4">
                <h2 className="text-3xl font-bold mb-4">🛡️ Obfuscate Your Binary Code with LLVM</h2>
                <p className="text-lg mb-4">
                  Protect your intellectual property with our advanced LLVM-based obfuscation techniques.
                </p>
                <Link href="/obfuscate">
                  <Button label="Get Started 🚀" className="p-button-raised p-button-primary" />
                </Link>
              </div>
            </div>
          </Card>
        </section>

        <section className="mb-4">
          <Card className="shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">🔑 Key Features</h3>
            <Accordion>
              <AccordionTab header="🔒 Pluto-based Obfuscation Passes">
                <p>Our current obfuscation passes are based on Pluto, providing robust protection for your code.</p>
              </AccordionTab>
              <AccordionTab header="🔍 Step-by-Step Exploration">
                <p>Learn how obfuscation works by exploring our pipeline, gaining insights into each step of the process.</p>
              </AccordionTab>
              <AccordionTab header="🚀 Advanced Features">
                <p>Contact us to learn about our more advanced features tailored for enterprise-level security needs.</p>
              </AccordionTab>
            </Accordion>
          </Card>
        </section>

        <section className="mb-4">
          <Card className="shadow-lg">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 pr-4">
                <h3 className="text-2xl font-semibold mb-4">💬 We Value Your Feedback</h3>
                <p className="mb-4">
                  Your input is crucial in helping us improve our obfuscation tools. We strive to provide the best possible
                  solution for your code protection needs.
                </p>
                <Link href="/contact"> 
                  <Button label="Provide Feedback 📝" className="p-button-raised p-button-secondary" />
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}