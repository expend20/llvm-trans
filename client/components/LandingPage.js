'use client'

import React from 'react'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { Accordion, AccordionTab } from 'primereact/accordion'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-gradient-to-br from-blue-100 to-indigo-200">
      <main className="flex-grow container mx-auto px-4 py-4" style={{ maxWidth: '800px' }}>
        <section className="mb-4">
          <Card className="shadow-lg">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 pr-4">
                <h2 className="text-3xl font-bold mb-4">🛡️ Obfuscate Your Binary Online</h2>
                <p className="text-lg mb-4">
                  Explore LLVM-based obfuscation tools to protect your code and discover the inner workings of this process.
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
                <p> Our current obfuscation passes incorporate <a href="https://github.com/bluesadi/Pluto/">Pluto</a>, 
                offering strong safeguards for your source code. We plan to implement additional passes soon. Which passes would you like to see integrated first?
                </p>
              </AccordionTab>
              <AccordionTab header="🔍 Step-by-Step Exploration">
                <p> Learn how obfuscation works by exploring our pipeline, gaining insights into each step of the process.</p>
              </AccordionTab>
              <AccordionTab header="🚀 Propose a feature">
                <p> We are currently looking for new features to add to our obfuscation tool. If you have an idea for a feature, 
                  please let us know.
                </p>
              </AccordionTab>
              <AccordionTab header="🌟 Open-Source & Sponsorship">
                <p>
                  Our project is open-source! Check out our code or open a merge request:
                  <ul className="list-disc list-inside mt-2">
                    <li>Frontend: <a href="https://github.com/expend20/llvm-trans">GitHub Repository</a>.</li>
                    <li>Backend: <a href="https://github.com/expend20/llvm-ob-passes">GitHub Repository</a>.</li>
                  </ul>
                </p>
                <p className="mt-2">
                  We're looking for sponsors! 📢 Want to have your logo in the header? <Link href="/contact">Contact us</Link> for sponsorship opportunities. 
                </p>
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
                  We highly value your feedback as it's essential for enhancing the product. Our goal is to
                  deliver an exceptional experience tailored to your needs.
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
