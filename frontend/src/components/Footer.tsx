import { Code2, Github, Twitter, Mail } from "lucide-react"

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-xl font-bold">
                <span className="text-foreground">Algo</span>
                <span className="text-primary">Univ</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Modern competitive programming platform for coding challenges and skill development.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/problems" className="hover:text-primary transition-colors">
                  Problems
                </a>
              </li>
              <li>
                <a href="/contests" className="hover:text-primary transition-colors">
                  Contests
                </a>
              </li>
              <li>
                <a href="/leaderboard" className="hover:text-primary transition-colors">
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="/tutorials" className="hover:text-primary transition-colors">
                  Tutorials
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/forum" className="hover:text-primary transition-colors">
                  Forum
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">© 2024 AlgoUniv. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
