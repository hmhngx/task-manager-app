import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckIcon, 
  PlayIcon, 
  StarIcon,
  BoltIcon,
  UserGroupIcon,
  BellIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ServerIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      category: "Core Tasking",
      items: [
        { icon: CheckIcon, title: "Smart Task Creation", description: "AI-powered task suggestions and templates" },
        { icon: BoltIcon, title: "Real-time Updates", description: "Instant synchronization across all devices" },
        { icon: UserGroupIcon, title: "Team Collaboration", description: "Seamless team coordination and delegation" }
      ]
    },
    {
      category: "AI Assistant",
      items: [
        { icon: SparklesIcon, title: "AI Insights", description: "Intelligent task prioritization and optimization" },
        { icon: CpuChipIcon, title: "Smart Automation", description: "Automated workflows and repetitive tasks" },
        { icon: ChatBubbleLeftRightIcon, title: "AI Chat Support", description: "24/7 intelligent assistance" }
      ]
    },
    {
      category: "Real-Time Collaboration",
      items: [
        { icon: UserGroupIcon, title: "Live Collaboration", description: "Real-time editing and commenting" },
        { icon: BellIcon, title: "Smart Notifications", description: "Context-aware alerts and reminders" },
        { icon: ServerIcon, title: "WebSocket Sync", description: "Instant updates without page refresh" }
      ]
    },
    {
      category: "Notifications",
      items: [
        { icon: BellIcon, title: "Precision Alerts", description: "Customizable notification preferences" },
        { icon: ShieldCheckIcon, title: "Security First", description: "JWT authentication and secure data" },
        { icon: ServerIcon, title: "MongoDB Backend", description: "Scalable and reliable data storage" }
      ]
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 10 tasks",
        "Basic AI suggestions",
        "Email notifications",
        "1 team member",
        "Basic templates"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      description: "Ideal for growing teams and professionals",
      features: [
        "Unlimited tasks",
        "Advanced AI insights",
        "Real-time collaboration",
        "Up to 10 team members",
        "Priority support",
        "Custom workflows",
        "Advanced analytics"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations with advanced needs",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Custom integrations",
        "Dedicated support",
        "Advanced security",
        "Custom branding",
        "API access"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Alejandro Garnacho",
      role: "Professional Footballer",
      company: "Manchester United",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvw-6gmPMfOZAw1yJTnSMAxJzhhJVTz6JMHw&s",
      quote: "TaskFlow supercharged my productivity, my exit from Manchester United is now confidently secured.",
      rating: 5
    },
    {
      name: "Marcus Rashford",
      role: "Professional Footballer",
      company: "Manchester United",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQekrWJDaEXDnXWZ_TyKfV7HCxNPbEZrrVL-A&s",
      quote: "Smart alerts and real-time updates keep everyone aligned, my move to Barcelona is finally confirmed.",
      rating: 5
    },
    {
      name: "Jadon Sancho",
      role: "Professional Footballer",
      company: "Manchester United",
      avatar: "https://preview.redd.it/manchester-united-prefer-cash-for-jadon-sancho-from-v0-de1cikjlcfaf1.jpeg?width=640&crop=smart&auto=webp&s=656122991218b426f2c89520ce757ef14321b8df",
      quote: "The AI assistant guided me with clarity, delivering the top options for leaving Manchester United.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fd] to-[#f1f3f9] font-sans text-[#2d2d2d] leading-relaxed">
      {/* Sticky Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-900">TaskFlow</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-blue-900 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-900 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-900 px-3 py-2 rounded-md text-sm font-medium">Testimonials</a>
                {isAuthenticated ? (
                  <Link to="/app" className="bg-blue-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                    Go to App
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-blue-900 px-3 py-2 rounded-md text-sm font-medium">Sign In</Link>
                    <Link to="/register" className="bg-blue-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-white via-[#EEF2FF] to-[#D1FAE5] min-h-[60vh] flex items-center scroll-mt-16 animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-[#2d2d2d]">
              Your Tasks.{' '}
              <span className="text-[#6c5ce7]">Smarter.</span>{' '}
              <span className="text-[#a29bfe]">Faster.</span>{' '}
              <span className="text-[#6c5ce7]">Together.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-loose text-[#2d2d2d]">
              Real-time task management with AI-powered insights, team collaboration, and precision notifications.
            </p>
            {/* HERO SECTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link to="/app" className="bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 hover:brightness-110 hover:opacity-90 focus:ring-2 focus:ring-[#6c5ce7] focus:outline-none transition-all duration-300 ease-in-out">
                  Go to App
                </Link>
              ) : (
                <>
                  <Link to="/register" className="bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 hover:brightness-110 hover:opacity-90 focus:ring-2 focus:ring-[#6c5ce7] focus:outline-none transition-all duration-300 ease-in-out">
                    Start Free
                  </Link>
                  <button className="flex items-center gap-2 bg-white text-[#2d2d2d] px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 hover:brightness-110 hover:opacity-90 focus:ring-2 focus:ring-[#6c5ce7] focus:outline-none transition-all duration-300 ease-in-out border">
                    <PlayIcon className="w-5 h-5 text-[#6c5ce7]" />
                    Watch Demo
                  </button>
                </>
              )}
            </div>
            {/* Dashboard Preview Section */}
            <div className="mt-12 flex justify-center">
              <div className="relative flex justify-center items-center">
                <div className="absolute -inset-4 bg-white/60 rounded-2xl blur-2xl drop-shadow-2xl z-0" style={{ filter: 'blur(32px)' }}></div>
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full backdrop-blur-md drop-shadow-xl hover:shadow-3xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-3xl focus:outline-none transition-all duration-300 ease-in-out">
                  <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-6">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-center text-gray-600">
                      <p className="text-lg font-medium">TaskFlow Dashboard Preview</p>
                      <p className="text-sm mt-2">Real-time collaboration • AI-powered insights • Smart notifications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem-Solution-Value Section */}
      <section className="py-16 bg-[#F9FAFB] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stop Struggling with Outdated Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional task managers are slow, disconnected, and lack intelligence. TaskFlow brings the future of productivity to your team.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none transition-all duration-300 ease-in-out">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Slow & Disconnected</h3>
              <p className="text-gray-600">Traditional tools lack real-time updates and leave teams in the dark.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none transition-all duration-300 ease-in-out">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Intelligence</h3>
              <p className="text-gray-600">Manual prioritization and no insights into productivity patterns.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none transition-all duration-300 ease-in-out">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BellIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Poor Notifications</h3>
              <p className="text-gray-600">Generic alerts that miss context and important updates.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">How TaskFlow Solves These Problems</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-lg focus:outline-none transition-all duration-300 ease-in-out">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Real-time Updates</h4>
                <p className="text-blue-800">WebSocket-powered synchronization keeps everyone connected instantly.</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-lg focus:outline-none transition-all duration-300 ease-in-out">
                <h4 className="text-lg font-semibold text-green-900 mb-2">AI-Powered Insights</h4>
                <p className="text-green-800">Machine learning optimizes your workflow and suggests improvements.</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-lg focus:outline-none transition-all duration-300 ease-in-out">
                <h4 className="text-lg font-semibold text-purple-900 mb-2">Smart Notifications</h4>
                <p className="text-purple-800">Context-aware alerts that matter, when they matter most.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-16 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage tasks efficiently, collaborate seamlessly, and stay productive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 text-center">{category.category}</h3>
                {category.items.map((feature, featureIndex) => (
                  <div key={featureIndex} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none transition-all duration-300 ease-in-out">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See TaskFlow in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how TaskFlow transforms your daily workflow with real-time collaboration and AI-powered insights.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-2xl focus:outline-none transition-all duration-300 ease-in-out">
            <div className="aspect-video bg-white rounded-lg shadow-lg flex items-center justify-center hover:shadow-2xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-2xl focus:outline-none transition-all duration-300 ease-in-out">
              <div className="text-center">
                <PlayIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Product Demo Video</p>
                <p className="text-sm text-gray-500 mt-2">Click to watch TaskFlow in action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-[#ECFDF5] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your team's needs. All plans include our core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-lg p-8 relative hover:shadow-2xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-2xl focus:outline-none transition-all duration-300 ease-in-out ${
                plan.popular ? 'ring-2 ring-[#6c5ce7] scale-105' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={isAuthenticated ? "/app" : (plan.name === "Free" ? "/register" : "/register")}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-colors shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none duration-300 ease-in-out ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white hover:brightness-110'
                      : 'bg-gray-100 text-[#2d2d2d] hover:bg-gray-200'
                  }`}
                >
                  {isAuthenticated ? "Go to App" : plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users have to say about TaskFlow's impact on their productivity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none transition-all duration-300 ease-in-out">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Stack Section */}
      <section className="py-16 bg-[#EFF6FF] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade security and cutting-edge technology power TaskFlow.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none transition-all duration-300 ease-in-out">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">JWT Authentication</h3>
              <p className="text-gray-600">Secure, stateless authentication for your data</p>
            </div>
            
            <div className="text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none transition-all duration-300 ease-in-out">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ServerIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">MongoDB Backend</h3>
              <p className="text-gray-600">Scalable, flexible database architecture</p>
            </div>
            
            <div className="text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none transition-all duration-300 ease-in-out">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WebSocket Sync</h3>
              <p className="text-gray-600">Real-time updates across all devices</p>
            </div>
            
            <div className="text-center shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-105 focus:scale-105 focus:shadow-xl focus:outline-none transition-all duration-300 ease-in-out">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Integration</h3>
              <p className="text-gray-600">Intelligent insights and automation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <section className="py-16 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of teams who have already upgraded to TaskFlow. Start your free trial today and experience the future of task management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link to="/app" className="bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 hover:brightness-110 hover:opacity-90 focus:ring-2 focus:ring-[#6c5ce7] focus:outline-none transition-all duration-300 ease-in-out">
                Go to App
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 hover:brightness-110 hover:opacity-90 focus:ring-2 focus:ring-[#6c5ce7] focus:outline-none transition-all duration-300 ease-in-out">
                  Get Started Free
                </Link>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:scale-105 hover:brightness-110 hover:opacity-90 focus:ring-2 focus:ring-[#6c5ce7] focus:outline-none transition-all duration-300 ease-in-out">
                  Schedule Demo
                </button>
              </>
            )}
          </div>
          <p className="text-blue-200 mt-4 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E3A8A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">TaskFlow</h3>
              <p className="text-gray-400">
                The intelligent task management platform for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TaskFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 