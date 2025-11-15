import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, Zap, TrendingUp, Camera, Globe, Megaphone, Video, Sparkles, Mail, Palette } from 'lucide-react';

// Navigation Component
const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b-2 border-pink-500">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
            NUNYA BUNYA
          </Link>
          <div className="flex gap-8">
            <Link to="/" className="font-bold text-lg text-gray-400 hover:text-white transition-all">
              Home
            </Link>
            <Link to="/services" className="font-bold text-lg text-gray-400 hover:text-white transition-all">
              Services
            </Link>
            <Link to="/contact" className="font-bold text-lg text-gray-400 hover:text-white transition-all">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Home Page Component
const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-4xl">
        <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Your Marketing Sucks.
        </h1>
        <h2 className="text-5xl font-bold mb-8 text-white">
          We Fix It.
        </h2>
        <p className="text-2xl mb-12 text-gray-300">
          Brisbane's boldest digital marketing agency. No fluff, no BS, just results.
        </p>
        <button
          onClick={() => navigate('/contact')}
          className="px-12 py-5 bg-gradient-to-r from-pink-500 to-cyan-500 text-white text-xl font-bold rounded-xl hover:scale-105 transition-all"
        >
          Get Started →
        </button>
      </div>
    </div>
  );
};

// Services Page Component
const ServicesPage = () => {
  const [activeService, setActiveService] = useState('social');
  const [selectedPackage, setSelectedPackage] = useState(null);

  const services = {
    social: {
      name: 'Social Media',
      icon: Megaphone,
      color: 'from-pink-500 to-pink-600',
      description: 'Stop posting into the void. Get content that actually converts.',
      monthly: [
        {
          name: 'Social Starter',
          price: '$1,600',
          period: '/month',
          description: 'Perfect for businesses getting serious about social',
          features: [
            '12 feed posts per month (3/week)',
            '12 stories per month',
            '4 short-form videos (Reels/TikToks)',
            'Content calendar & strategy',
            'Community management (respond to comments/DMs)',
            'Monthly performance report'
          ],
          notIncluded: ['Paid ads', 'Professional photoshoots', 'Influencer outreach'],
          bestFor: 'Small businesses wanting consistent, professional presence',
          investment: '$1,600/month, 3-month minimum'
        },
        {
          name: 'Social Growth',
          price: '$2,600',
          period: '/month',
          description: 'For businesses ready to dominate their niche',
          features: [
            '20 feed posts per month (5/week)',
            '20 stories per month',
            '8 short-form videos (Reels/TikToks)',
            'Advanced content strategy',
            'Community management + proactive engagement',
            'Influencer outreach & partnerships',
            'Monthly analytics deep-dive',
            'Quarterly photoshoot (20 images)'
          ],
          notIncluded: ['Paid advertising management', 'Website development'],
          bestFor: 'Growing businesses with $500K+ revenue ready to scale',
          investment: '$2,600/month, 6-month minimum'
        },
        {
          name: 'Social Elite',
          price: '$4,000',
          period: '/month',
          description: 'Premium tier for brands that need to own their market',
          features: [
            '28 feed posts per month (daily)',
            '28 stories per month',
            '12 short-form videos (3/week)',
            'Full-service content production',
            'Community management + brand monitoring',
            'Influencer campaign management',
            'Monthly photoshoot (40 images)',
            'Priority support & strategy sessions',
            'Bi-weekly performance reviews'
          ],
          notIncluded: ['Paid advertising (sold separately)'],
          bestFor: '$1M+ revenue businesses serious about market dominance',
          investment: '$4,000/month, annual commitment'
        }
      ],
      project: []
    },
    authority: {
      name: 'Authority Marketing',
      icon: TrendingUp,
      color: 'from-cyan-500 to-cyan-600',
      description: 'Build your personal brand. Become the go-to expert in your industry.',
      monthly: [
        {
          name: 'Authority Starter',
          price: '$3,200',
          period: '/month',
          description: 'Build your personal brand and thought leadership',
          features: [
            '2 long-form videos per month (5-10 min)',
            '8 repurposed short clips',
            'LinkedIn ghostwriting (4 posts/week)',
            'Content strategy & calendar',
            'Video editing & optimization',
            'Platform distribution (LinkedIn, YouTube, Instagram)',
            'Monthly analytics review'
          ],
          notIncluded: ['Photoshoots', 'Paid advertising', 'Podcast production'],
          bestFor: 'Executives, consultants, coaches building personal brands',
          investment: '$3,200/month + $1,200 setup, 6-month minimum'
        },
        {
          name: 'Authority Elite',
          price: '$6,500',
          period: '/month',
          description: 'Become the undisputed authority in your industry',
          features: [
            '4 long-form videos per month (10-15 min)',
            '16 repurposed short clips',
            'LinkedIn ghostwriting (daily)',
            'Twitter/X ghostwriting (3-5 tweets/day)',
            'Monthly newsletter (written + designed)',
            'Podcast production support',
            'PR & media outreach',
            'Monthly photoshoot',
            'Bi-weekly strategy sessions',
            'Priority crisis management'
          ],
          notIncluded: ['Speaking engagement booking', 'Book ghostwriting'],
          bestFor: '$500K+ personal brands or C-suite executives',
          investment: '$6,500/month + $2,500 setup, annual commitment'
        }
      ],
      project: []
    },
    ads: {
      name: 'Paid Advertising',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      description: 'Stop burning money on ads. Get campaigns that actually deliver ROI.',
      monthly: [
        {
          name: 'Ads Growth',
          price: '$2,000',
          period: '/month + ad spend',
          description: 'Professional ad management that actually delivers ROI',
          features: [
            'Meta Ads (Facebook & Instagram)',
            'Google Ads (Search & Display)',
            'Campaign strategy & setup',
            '6 ad creatives per month',
            'Landing page optimization',
            'A/B testing & optimization',
            'Weekly performance reports',
            'Monthly strategy calls'
          ],
          notIncluded: ['Video production', 'Advanced funnel building', 'Email marketing'],
          bestFor: 'Businesses spending $5K+/month on ads',
          investment: '$2,000/month management fee + your ad budget (min $5K/month), 6-month minimum'
        },
        {
          name: 'Ads Elite',
          price: '$4,500',
          period: '/month + ad spend',
          description: 'Full-funnel advertising domination',
          features: [
            'Multi-platform campaigns (Meta, Google, TikTok, LinkedIn)',
            'Advanced funnel strategy',
            '12 ad creatives per month',
            'Video ad production',
            'Landing page design & testing',
            'Email automation integration',
            'Conversion rate optimization',
            'Daily monitoring & optimization',
            'Weekly detailed reports',
            'Bi-weekly strategy sessions'
          ],
          notIncluded: ['Organic social media', 'SEO services'],
          bestFor: 'Businesses spending $20K+/month on ads',
          investment: '$4,500/month management fee + your ad budget (min $20K/month), annual commitment'
        }
      ],
      project: []
    },
    photography: {
      name: 'Photography',
      icon: Camera,
      color: 'from-blue-500 to-blue-600',
      description: 'Stock photos are killing your brand. Get images that actually sell.',
      monthly: [],
      project: [
        {
          name: 'Photo Starter',
          subtitle: 'Brand Session',
          price: '$1,000',
          timeline: '2-hour shoot',
          description: 'Perfect for refreshing your brand imagery',
          includes: [
            '2-hour shoot (1 location)',
            '30 professionally edited images',
            'Creative direction included',
            '2-week delivery',
            'High-res + web-optimized files'
          ],
          bestFor: 'Headshots, product shots, basic brand content',
          deliverables: '30 edited images, all rights included',
          investment: '$1,000 one-time'
        },
        {
          name: 'Photo Growth',
          subtitle: 'Campaign Shoot',
          price: '$1,800',
          timeline: 'Half-day (4 hours)',
          description: 'Comprehensive shoot for campaigns or content needs',
          includes: [
            'Half-day shoot (4 hours, 2 locations)',
            '60 professionally edited images',
            'Full production support',
            'Styling consultation',
            '1-week priority delivery',
            'All file formats'
          ],
          bestFor: 'Marketing campaigns, website updates, content libraries',
          deliverables: '60 edited images, commercial license',
          investment: '$1,800 one-time'
        },
        {
          name: 'Photo Elite',
          subtitle: 'Full-Day Production',
          price: '$3,200',
          timeline: 'Full day (8 hours)',
          description: 'Premium production for major campaigns',
          includes: [
            'Full-day shoot (8 hours, multiple locations)',
            '120+ professionally edited images',
            'Studio + location options',
            'Full production team',
            'BTS video content',
            '3-day rush delivery',
            'Unlimited commercial use'
          ],
          bestFor: 'Major campaigns, catalog shoots, annual content libraries',
          deliverables: '120+ edited images + BTS video',
          investment: '$3,200 one-time'
        }
      ]
    },
    web: {
      name: 'Web Design',
      icon: Globe,
      color: 'from-green-500 to-green-600',
      description: 'Your website should make you money. Not just look pretty.',
      monthly: [],
      project: [
        {
          name: 'Web Starter',
          subtitle: 'Landing Page',
          price: '$1,500',
          timeline: '2-3 weeks',
          description: 'Single high-converting page for campaigns or lead gen',
          includes: [
            '1-page custom design',
            'Conversion-focused copywriting',
            'Mobile responsive',
            'SEO basics setup',
            'Contact form integration',
            '1 month of support'
          ],
          bestFor: 'Lead magnets, product launches, event registrations',
          deliverables: 'Live website, design files',
          investment: '$1,500 one-time'
        },
        {
          name: 'Web Growth',
          subtitle: 'Small Business Site',
          price: '$3,200',
          timeline: '4-5 weeks',
          description: 'Professional multi-page website for established businesses',
          includes: [
            '3-5 page custom design',
            'Full copywriting included',
            'Mobile responsive',
            'Google Analytics setup',
            'SEO optimization',
            'Contact forms + integrations',
            '2 months of support'
          ],
          bestFor: 'Service businesses, consultants, small companies',
          deliverables: 'Live website, CMS training, analytics',
          investment: '$3,200 one-time'
        },
        {
          name: 'Web Elite',
          subtitle: 'Premium Website',
          price: '$5,500',
          timeline: '6-8 weeks',
          description: 'Enterprise-level website with advanced features',
          includes: [
            'Up to 8 custom pages',
            'Custom animations & interactions',
            'E-commerce ready (if needed)',
            'Advanced SEO optimization',
            'CRM/email integrations',
            'Performance optimization',
            '3 months premium support'
          ],
          bestFor: '$1M+ revenue companies needing premium web presence',
          deliverables: 'Live website, full documentation, training',
          investment: '$5,500 one-time'
        }
      ]
    },
    brand: {
      name: 'Brand & Creative',
      icon: Palette,
      color: 'from-orange-500 to-orange-600',
      description: 'Boring brands get ignored. Legendary brands get remembered.',
      monthly: [],
      project: [
        {
          name: 'Foundations Package',
          price: '$2,800',
          timeline: '3-4 weeks',
          description: 'Build your brand from scratch or complete rebrand',
          includes: [
            'Full brand strategy session',
            'Logo + visual identity system',
            'Color palette + typography',
            '15-page brand style guide',
            'Canva launch kit (social templates)'
          ],
          bestFor: 'New brands or complete rebrands',
          deliverables: 'Brand guidelines, logo files, Canva templates',
          investment: '$2,800 one-time'
        },
        {
          name: 'Launch Package',
          price: '$5,500',
          timeline: '5-7 weeks',
          description: 'Everything you need to launch with massive impact',
          includes: [
            'Full creative direction & campaign strategy',
            '1 hero video (2-3 min) + 8 repurposed shorts',
            'Half-day photoshoot (50 edited images)',
            '4-week campaign copywriting',
            'Content calendar',
            'Launch day coordination'
          ],
          bestFor: 'Product launches, brand launches, major announcements',
          deliverables: 'Video content, photography, copy, campaign plan',
          investment: '$5,500 one-time'
        }
      ]
    },
    complete: {
      name: 'Complete Marketing',
      icon: Sparkles,
      color: 'from-pink-500 via-purple-500 to-cyan-500',
      description: 'Your entire marketing department. Handled.',
      monthly: [
        {
          name: 'Complete Marketing Machine',
          price: '$10,000',
          period: '/month',
          description: 'Your entire marketing department, outsourced',
          features: [
            'Social Elite package (28 posts + 12 videos)',
            'Authority Builder (2 long videos + 10 shorts)',
            'Ads Growth (multi-platform + 6 creatives)',
            'Monthly photoshoot (30 images)',
            'Email marketing (4 campaigns/month)',
            'Website updates & optimization',
            'Content strategy & planning',
            'Bi-weekly strategy sessions',
            'Priority support & crisis management',
            'Quarterly business review'
          ],
          notIncluded: ['Product development', 'Sales team training'],
          bestFor: '$3M+ revenue companies needing complete marketing outsourcing',
          investment: '$10,000/month, saves you $4,000/month vs buying separately, 6-month minimum',
          highlight: 'SAVE $4,000/MONTH'
        }
      ],
      project: []
    }
  };

  const PackageCard = ({ pkg, isMonthly }) => (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-2xl p-8 hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20 group relative">
      {pkg.highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-cyan-500 text-white text-sm font-bold px-4 py-2 rounded-full">
          {pkg.highlight}
        </div>
      )}
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{pkg.name}</h3>
          {pkg.subtitle && <p className="text-gray-400 text-sm">{pkg.subtitle}</p>}
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
            {pkg.price}
          </div>
          <div className="text-gray-400 text-sm">{pkg.period || pkg.timeline}</div>
        </div>
      </div>

      <p className="text-gray-300 mb-6">{pkg.description}</p>

      <div className="space-y-6">
        <div>
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-pink-400" />
            {pkg.features ? "What's Included:" : "Includes:"}
          </h4>
          <ul className="space-y-2">
            {(pkg.features || pkg.includes || []).map((item, i) => (
              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {pkg.notIncluded && (
          <div>
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <X className="w-5 h-5 text-gray-500" />
              Not Included:
            </h4>
            <ul className="space-y-2">
              {pkg.notIncluded.map((item, i) => (
                <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                  <X className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pkg.bestFor && (
          <div className="pt-4 border-t border-gray-800">
            <p className="text-cyan-400 text-sm font-semibold mb-1">Best For:</p>
            <p className="text-gray-300 text-sm">{pkg.bestFor}</p>
          </div>
        )}

        {pkg.investment && (
          <div className="pt-4 border-t border-gray-800">
            <p className="text-pink-400 text-sm font-semibold mb-1">Investment:</p>
            <p className="text-gray-300 text-sm">{pkg.investment}</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => setSelectedPackage(pkg)}
        className="w-full mt-6 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3"
      >
        Select Package
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const currentService = services[activeService];
  const Icon = currentService.icon;

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Services & Packages
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transparent pricing. No bullshit. Choose what fits your business.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {Object.entries(services).map(([key, service]) => {
            const ServiceIcon = service.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveService(key)}
                className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  activeService === key
                    ? `bg-gradient-to-r ${service.color} text-white shadow-lg`
                    : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <ServiceIcon className="w-5 h-5" />
                {service.name}
              </button>
            );
          })}
        </div>

        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${currentService.color} p-4 rounded-xl mb-4`}>
            <Icon className="w-8 h-8 text-white" />
            <h2 className="text-3xl font-black text-white">{currentService.name}</h2>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {currentService.description}
          </p>
        </div>

        <div className="space-y-12">
          {currentService.monthly.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-cyan-500 rounded"></div>
                Monthly Packages
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentService.monthly.map((pkg, i) => (
                  <PackageCard key={i} pkg={pkg} isMonthly={true} />
                ))}
              </div>
            </div>
          )}

          {currentService.project.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded"></div>
                Project-Based
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentService.project.map((pkg, i) => (
                  <PackageCard key={i} pkg={pkg} isMonthly={false} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-20 text-center bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-2xl p-12 border border-pink-500/30">
          <h2 className="text-4xl font-black mb-4">Not Sure Which Package?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Book a free strategy call and we'll figure out exactly what you need to dominate your market.
          </p>
          <button className="bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-lg text-lg hover:shadow-xl hover:shadow-pink-500/50 transition-all">
            Book Free Strategy Call
          </button>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-black text-white mb-8 text-center">Add-Ons & Extras</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Extra Short Video', price: '$250' },
              { name: 'Extra Long Video (5-10min)', price: '$1,200' },
              { name: 'Rush Delivery (48hrs)', price: '+25%' },
              { name: 'Monthly Copywriting', price: '$500/mo' },
              { name: 'Email Marketing Setup', price: '$900' },
              { name: 'Brand Refresh', price: '$1,200' },
              { name: '1-Hour Strategy Session', price: '$300' },
              { name: 'Crisis Management Retainer', price: '$600/mo' }
            ].map((addon, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-cyan-500/50 transition-all">
                <h3 className="text-white font-bold mb-2">{addon.name}</h3>
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                  {addon.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-pink-500/50">
            <h2 className="text-3xl font-black text-white mb-4">
              Selected: {selectedPackage.name}
            </h2>
            <p className="text-gray-300 mb-6">
              Great choice! Ready to get started or want to discuss customization?
            </p>
            <div className="flex gap-4">
              <button className="flex-1 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all">
                Book Discovery Call
              </button>
              <button 
                onClick={() => setSelectedPackage(null)}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Contact Page Component
const ContactPage = () => {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Let's Talk
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Email: hello@nunyabunya.com
        </p>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="border-t-2 border-cyan-500 bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-gray-400">© 2025 Nunya Bunya. All rights reserved.</p>
      </div>
    </footer>
  );
};

// Main App Component with Router
const NunyaBunyaWebsite = () => {
  return (
    <Router>
      <div className="bg-black text-white min-h-screen">
        <Navigation />
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default NunyaBunyaWebsite;
