import { Metadata } from 'next'
import { Calendar, Clock, User, ArrowRight, BookOpen, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import SiteHeader from "@/components/site-header"
import Footer from "@/components/footer"
import ArticleSchema from "@/components/article-schema"

export const metadata: Metadata = {
  title: 'PayVAT Blog - Irish VAT News, Updates & Business Compliance Tips',
  description: 'Stay updated with the latest Irish VAT regulations, compliance tips, and business guidance. Expert insights on Revenue changes, deadlines, and VAT best practices.',
}

export default function BlogPage() {
  const featuredPost = {
    title: "VAT Threshold Changes 2025: What Irish Businesses Need to Know",
    excerpt: "Revenue Ireland has updated VAT registration thresholds for 2025. Learn how these changes affect your business and what you need to do to stay compliant.",
    slug: "vat-threshold-changes-2025",
    date: "2025-01-15",
    readTime: "5 min read",
    category: "VAT Updates",
    featured: true
  }

  const recentPosts = [
    {
      title: "5 Common VAT Filing Mistakes Irish Businesses Make (And How to Avoid Them)",
      excerpt: "Discover the most frequent VAT errors that cost Irish businesses time and money, plus practical solutions to prevent them.",
      slug: "common-vat-filing-mistakes-ireland",
      date: "2025-01-10",
      readTime: "4 min read",
      category: "Compliance Tips"
    },
    {
      title: "Digital Services VAT: New Rules for Irish Online Businesses",
      excerpt: "Understanding the latest VAT requirements for digital services and how PayVAT simplifies compliance for online businesses.",
      slug: "digital-services-vat-ireland-2025",
      date: "2025-01-05",
      readTime: "6 min read",
      category: "Industry Updates"
    },
    {
      title: "Brexit Impact: Updated VAT Rules for Irish-UK Trade in 2025",
      excerpt: "How Brexit continues to affect VAT on goods and services between Ireland and the UK, with practical guidance for businesses.",
      slug: "brexit-vat-rules-ireland-uk-2025",
      date: "2024-12-28",
      readTime: "7 min read",
      category: "International VAT"
    },
    {
      title: "Construction Sector VAT: Reverse Charge Mechanism Explained",
      excerpt: "Complete guide to VAT reverse charges in Irish construction, including when they apply and how to implement them correctly.",
      slug: "construction-vat-reverse-charge-ireland",
      date: "2024-12-20",
      readTime: "5 min read",
      category: "Sector Guides"
    }
  ]

  const categories = [
    { name: "VAT Updates", count: 12 },
    { name: "Compliance Tips", count: 18 },
    { name: "Business Guides", count: 15 },
    { name: "Industry Updates", count: 8 },
    { name: "International VAT", count: 6 },
    { name: "Sector Guides", count: 10 }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ArticleSchema
        title="PayVAT Blog - Irish VAT News, Updates & Business Compliance"
        description="Expert insights on Irish VAT compliance, Revenue updates, and business guidance for Irish companies."
        keywords={["Irish VAT blog", "VAT compliance tips", "Revenue Ireland updates", "VAT news Ireland", "business compliance blog"]}
        url="https://payvat.ie/blog"
      />
      <SiteHeader 
        searchPlaceholder="Search blog articles..."
        currentPage="Blog"
        pageSubtitle="Latest VAT news and compliance insights"
      />

      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">
        {/* Featured Article */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-normal text-foreground mb-4">
              Irish VAT <span className="text-gradient-primary">Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stay ahead of Irish VAT regulations with expert insights, compliance tips, and the latest Revenue updates
            </p>
          </div>

          <Card className="card-premium hover-lift group mb-16">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="secondary" className="bg-warning text-warning-foreground">
                    Featured
                  </Badge>
                  <Badge variant="outline">{featuredPost.category}</Badge>
                </div>
                <h2 className="text-2xl lg:text-3xl font-normal text-foreground mb-4 group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Jan 15, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
                <Button className="btn-primary hover-lift">
                  Read Full Article
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-8 lg:p-12">
                <div className="text-center">
                  <div className="icon-premium mb-4 mx-auto">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-normal text-foreground mb-2">Featured Article</h3>
                  <p className="text-muted-foreground">Essential reading for Irish businesses</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Recent Articles Grid */}
        <section className="py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Articles */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-normal text-foreground">
                  Recent <span className="text-gradient-primary">Articles</span>
                </h2>
                <Button variant="outline" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </div>

              <div className="space-y-6">
                {recentPosts.map((post, index) => (
                  <Card key={index} className="card-modern hover-lift group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(post.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-normal text-foreground mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <Button variant="ghost" size="sm" className="hover:text-primary">
                        Read More
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Categories */}
              <Card className="card-modern mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-normal">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between py-2 hover:bg-muted/50 rounded px-2 -mx-2 cursor-pointer transition-colors">
                      <span className="text-sm text-foreground">{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className="card-premium">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="icon-premium mb-4 mx-auto">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-normal text-foreground mb-2">Stay Updated</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get the latest VAT updates and compliance tips delivered to your inbox
                    </p>
                    <Button size="sm" className="btn-primary w-full hover-lift">
                      Subscribe to Newsletter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* PayVAT CTA */}
              <Card className="card-modern mt-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-normal text-foreground mb-2">
                      Simplify Your VAT Compliance
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Let PayVAT handle your Irish VAT submissions automatically
                    </p>
                    <Button size="sm" className="btn-primary w-full hover-lift">
                      Start Free Trial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}