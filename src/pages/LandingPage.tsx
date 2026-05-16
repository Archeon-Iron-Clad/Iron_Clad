import { MarketingNav } from '../components/marketing/MarketingNav'
import { HeroSection } from '../components/marketing/HeroSection'
import { AboutAimSection } from '../components/marketing/AboutAimSection'
import { TeamSection } from '../components/marketing/TeamSection'
import { SignUpSection } from '../components/marketing/SignUpSection'
import { MarketingFooter } from '../components/marketing/MarketingFooter'
import '../components/marketing/marketing.css'

export function LandingPage() {
  return (
    <div className="marketing-landing marketing-grain min-h-screen">
      <MarketingNav />
      <main>
        <HeroSection />
        <AboutAimSection />
        <TeamSection />
        <SignUpSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
