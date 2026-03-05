import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, Zap, TrendingUp, Camera, Globe, Megaphone, Video, Sparkles, Mail, Palette, Lock, ChevronDown, ChevronRight, Search, LogOut } from 'lucide-react';

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

// ── Foundations Checklist Data ──────────────────────────────────────────
const checklistData = [
  {
    id: 's00', number: '00', title: 'Ben HQ', description: 'Central operations hub & personal command center',
    subsections: [
      { title: 'Brand & Identity', items: ['Brand Bible', 'Logo Suite', 'Style Guide'] },
      { title: 'Strategy & Planning', items: ['Workspace Organization', 'Five Year Plan', 'Foundational Docs Summary', 'Master Budget & P&L Tracker', 'Cross-Business Calendar'] },
      { title: 'Operations & Systems', items: ['Master SOPs Document', 'Password & Accounts Registry', 'Vendor & Contractor Directory', 'Insurance & Compliance Tracker'] },
      { title: 'Templates (Cross-Business)', items: ['Universal Invoice Template', 'Universal Contract Template', 'NDA Template', 'Meeting Agenda Template'] },
    ]
  },
  {
    id: 's01', number: '01', title: 'Conner Law Group', description: 'Umbrella for Merkel & Conner, Conner Injury Law, MBCS, KevLaw AI',
    subsections: [
      { title: 'Brand & Identity', items: ['Brand Bible', 'Brand Guidelines', 'Logo Suite', 'Style Guide', 'Elevator Pitch / Positioning'] },
      { title: 'Strategy & Finance', items: ['Service Packages & Pricing', 'Business Plan', 'Financial Projections', 'Growth Roadmap'] },
      { title: 'Client & Legal Ops', items: ['Client Onboarding Process', 'Case Templates & Forms', 'Demand Letter Templates', 'Client Intake Form Template', 'Retainer Agreement Template'] },
      { title: 'Branded Templates', items: ['Branded Letterhead', 'Branded Email Signature', 'Branded Invoice Template', 'Branded Proposal Template', 'Business Card Design', 'Branded Slide Deck Template'] },
      { title: 'Content & Marketing', items: ['Content Calendar', 'Social Media Templates', 'Website Copy', 'KevLaw AI Marketing Page'] },
      { title: 'Technology', items: ['KevLaw AI App', 'KevLaw AI SaaS Pricing Page', 'CASEpeer Integration Docs'] },
    ]
  },
  {
    id: 's02', number: '02', title: 'Ben Alek Conner', description: 'Personal brand — multi-passionate entrepreneur',
    subsections: [
      { title: 'Brand & Identity', items: ['Brand Bible', 'Personal Brand Foundation', 'Logo Suite', 'Style Guide', 'Elevator Pitch'] },
      { title: 'Strategy & Planning', items: ['Business Plan / Monetization Strategy', 'Roadmap', 'Revenue Goals & Milestones'] },
      { title: 'Content & Marketing', items: ['Content Calendar', 'Launch Content', 'Social Media Strategy', 'YouTube Channel Kit', 'Podcast Launch Plan'] },
      { title: 'Branded Templates', items: ['Business Card Design', 'Email Signature', 'Branded Slide Deck', 'Media Kit / One-Pager', 'Resume'] },
    ]
  },
  {
    id: 's03', number: '03', title: 'Nunya Bunya', description: 'Digital marketing agency — $35K MRR goal',
    subsections: [
      { title: 'Brand & Identity', items: ['Brand Bible', 'Brand Guidelines', 'Logo Suite', 'Style Guide', 'Elevator Pitch', 'Brand Sheet'] },
      { title: 'Strategy & Finance', items: ['Business Plan', 'Service Packages & Pricing', 'Strategy & Content Plan', 'Business Strategy Doc', 'Financial Projections Spreadsheet'] },
      { title: 'Client Operations', items: ['Client Onboarding Process', 'Client Proposal Template', 'Client Contract / Service Agreement', 'Client Reporting Template', 'Client Offboarding Checklist'] },
      { title: 'Branded Templates', items: ['Stationery Suite', 'Business Card & Landing Page', 'Branded Invoice Template', 'Branded Slide Deck Template', 'Branded Email Signature', 'Social Media Post Templates'] },
      { title: 'Content & Marketing', items: ['Content Calendar', 'Launch Content', 'Social Media Profiles', 'Case Study Template'] },
      { title: 'Technology', items: ['Website', 'Backend System'] },
    ]
  },
  {
    id: 's04', number: '04', title: 'ORCA Film Awards', description: 'Film awards event & content platform',
    subsections: [
      { title: 'Brand & Identity', items: ['Brand Bible', 'Brand Guidelines', 'Logo Suite', 'Style Guide', 'Elevator Pitch'] },
      { title: 'Strategy & Finance', items: ['Business Plan', 'Service Packages / Sponsorship Tiers', 'Event Budget Template', 'Revenue Model'] },
      { title: 'Event Operations', items: ['Nominations Ballot', 'Event Planning Checklist', 'Sponsor Proposal Template', 'Submission Guidelines', 'Judge Scoring Rubric'] },
      { title: 'Branded Templates & Content', items: ['Award Certificate Template', 'Nomination Announcement Graphics', 'Social Media Templates', 'Content Calendar', 'Launch Content', 'Press Kit / Media One-Pager'] },
    ]
  },
  {
    id: 's05', number: '05', title: 'Power Portraits', description: 'Premium headshot photography — $150K annual goal',
    subsections: [
      { title: 'Brand & Identity', items: ['Brand Bible', 'Brand Book', 'Business Foundation', 'Logo Suite', 'Style Guide', 'Elevator Pitch'] },
      { title: 'Strategy & Finance', items: ['Service Packages', 'Strategy & Content Plan', 'Financial Projections Spreadsheet', 'Roadmap'] },
      { title: 'Client Operations', items: ['Client Onboarding Process', 'Booking Confirmation Template', 'Session Prep Guide', 'Photo Release / Model Release Form', 'Gallery Delivery Template'] },
      { title: 'Branded Templates & Content', items: ['Branded Invoice Template', 'Business Card Design', 'Email Signature', 'Social Media Post Templates', 'Content Calendar', 'Corporate Package Proposal Template'] },
    ]
  },
  {
    id: 's06', number: '06', title: 'Bella Rhyder', description: 'Personal brand / project',
    subsections: [
      { title: 'Brand & Identity', items: ['Brand Bible', 'Brand Guidelines', 'Logo Suite', 'Style Guide', 'Elevator Pitch / Positioning'] },
      { title: 'Strategy & Finance', items: ['Business Plan / Brand Strategy', 'Service Packages', 'Revenue Model'] },
      { title: 'Content & Marketing', items: ['Content Calendar', 'Social Media Strategy', 'Photo Assets', 'Launch Content Plan'] },
      { title: 'Branded Templates', items: ['Business Card Design', 'Email Signature', 'Social Media Post Templates', 'Media Kit / One-Pager'] },
    ]
  },
  {
    id: 's07', number: '07', title: 'The Conner Store', description: 'E-commerce product brand',
    subsections: [
      { title: 'Brand & Identity', items: ['Brand Bible', 'Brand Guidelines', 'Logo Suite', 'Style Guide', 'Elevator Pitch / Tagline'] },
      { title: 'Strategy & Finance', items: ['Business Plan', 'Product Catalog / Pricing', 'Supplier & Fulfillment Plan', 'Revenue Projections'] },
      { title: 'E-Commerce Operations', items: ['Product Listing Template', 'Order Confirmation Email Template', 'Shipping & Returns Policy', 'Customer Service Scripts', 'Packaging Design / Unboxing Guide'] },
      { title: 'Branded Templates & Marketing', items: ['Product Photography Standards', 'Social Media Post Templates', 'Email Marketing Templates', 'Content Calendar', 'Launch Campaign Plan'] },
    ]
  },
  {
    id: 's08', number: '08', title: 'Content Studio', description: 'Creative content services hub',
    subsections: [
      { title: 'Brand & Identity', items: ['Brand Bible', 'Brand Guidelines', 'Logo Suite', 'Style Guide', 'Elevator Pitch / Positioning'] },
      { title: 'Strategy & Finance', items: ['Business Plan', 'Service Packages & Pricing', 'Revenue Goals & Projections', 'Growth Roadmap'] },
      { title: 'Client Operations', items: ['Client Onboarding Process', 'Client Proposal Template', 'Service Agreement / Contract', 'Project Brief Template', 'Deliverables Checklist Template'] },
      { title: 'Branded Templates & Marketing', items: ['Business Card Design', 'Email Signature', 'Branded Invoice Template', 'Portfolio / Case Study Template', 'Social Media Post Templates', 'Content Calendar'] },
    ]
  },
];

// ── Portal Password Gate ───────────────────────────────────────────────
const PORTAL_PASS_HASH = 'nb2026admin';

const PortalLogin = ({ onAuth }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === PORTAL_PASS_HASH) {
      localStorage.setItem('nb_portal_auth', 'true');
      onAuth(true);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`max-w-md w-full ${shake ? 'animate-pulse' : ''}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Backend Portal</h1>
          <p className="text-gray-400">Enter password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Password"
            className={`w-full px-6 py-4 bg-gray-900 border-2 ${error ? 'border-red-500' : 'border-gray-700 focus:border-pink-500'} rounded-xl text-white text-lg outline-none transition-colors`}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm text-center">Incorrect password</p>}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all"
          >
            Enter Portal
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Interactive Foundations Checklist ───────────────────────────────────
const FoundationsChecklist = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nb_checklist') || '{}'); } catch { return {}; }
  });
  const [expanded, setExpanded] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('nb_checklist', JSON.stringify(checked));
  }, [checked]);

  const itemKey = (sectionId, subIdx, itemIdx) => `${sectionId}_${subIdx}_${itemIdx}`;

  const toggleCheck = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (sectionId) => {
    setExpanded(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const getSectionProgress = (section) => {
    let total = 0, done = 0;
    section.subsections.forEach((sub, si) => {
      sub.items.forEach((_, ii) => {
        total++;
        if (checked[itemKey(section.id, si, ii)]) done++;
      });
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const getOverallProgress = () => {
    let total = 0, done = 0;
    checklistData.forEach(section => {
      const p = getSectionProgress(section);
      total += p.total;
      done += p.done;
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  const handleLogout = () => {
    localStorage.removeItem('nb_portal_auth');
    navigate('/');
  };

  const matchesSearch = (text) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const overall = getOverallProgress();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-20 z-40 bg-black/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Foundations Checklist
              </h1>
              <p className="text-gray-400 text-sm">{overall.done} of {overall.total} items complete</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">{overall.pct}%</span>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white transition-colors" title="Log out">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Overall progress bar */}
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${overall.pct}%` }}
            />
          </div>
          {/* Search */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-pink-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {checklistData.map((section) => {
          const progress = getSectionProgress(section);
          const isExpanded = expanded[section.id] || searchQuery;

          // Filter for search
          const hasMatch = searchQuery
            ? matchesSearch(section.title) || matchesSearch(section.description) ||
              section.subsections.some(sub => matchesSearch(sub.title) || sub.items.some(item => matchesSearch(item)))
            : true;

          if (!hasMatch) return null;

          return (
            <div key={section.id} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-5 flex items-center gap-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center font-black text-sm">
                  {section.number}
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-lg font-bold text-white">{section.title}</h2>
                  <p className="text-gray-400 text-sm">{section.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-sm font-bold ${progress.pct === 100 ? 'text-green-400' : progress.pct > 0 ? 'text-cyan-400' : 'text-gray-500'}`}>
                      {progress.done}/{progress.total}
                    </span>
                    <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progress.pct === 100 ? 'bg-green-400' : 'bg-gradient-to-r from-pink-500 to-cyan-500'}`}
                        style={{ width: `${progress.pct}%` }}
                      />
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                </div>
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-6">
                  {section.subsections.map((sub, si) => {
                    const subHasMatch = searchQuery
                      ? matchesSearch(sub.title) || sub.items.some(item => matchesSearch(item))
                      : true;
                    if (!subHasMatch) return null;

                    return (
                      <div key={si}>
                        <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-3 pl-1">{sub.title}</h3>
                        <div className="space-y-1">
                          {sub.items.map((item, ii) => {
                            if (searchQuery && !matchesSearch(item) && !matchesSearch(sub.title)) return null;
                            const key = itemKey(section.id, si, ii);
                            const isChecked = !!checked[key];
                            return (
                              <label
                                key={ii}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-green-500/10 border border-green-500/20'
                                    : 'hover:bg-gray-800/50 border border-transparent'
                                }`}
                              >
                                <div className="relative flex-shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleCheck(key)}
                                    className="sr-only"
                                  />
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    isChecked
                                      ? 'bg-gradient-to-r from-pink-500 to-cyan-500 border-transparent'
                                      : 'border-gray-600 hover:border-pink-500'
                                  }`}>
                                    {isChecked && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </div>
                                <span className={`text-sm transition-all ${isChecked ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                                  {item}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Portal Page (Password Gated) ───────────────────────────────────────
const PortalPage = () => {
  const [authed, setAuthed] = useState(() => localStorage.getItem('nb_portal_auth') === 'true');

  if (!authed) return <PortalLogin onAuth={setAuthed} />;
  return <FoundationsChecklist />;
};

// Footer Component
const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="border-t-2 border-cyan-500 bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-gray-400">
          <span
            onClick={() => navigate('/portal')}
            className="cursor-default select-none"
            title=""
          >©</span> 2025 Nunya Bunya. All rights reserved.
        </p>
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
            <Route path="/portal" element={<PortalPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default NunyaBunyaWebsite;
