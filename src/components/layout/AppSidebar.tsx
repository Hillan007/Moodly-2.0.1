import {
  Brain,
  Calendar,
  Heart,
  Home,
  PenTool,
  Target,
  TrendingUp,
  User,
  Wind,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    description: 'Overview of your wellness journey'
  },
  {
    title: 'Mood Tracker',
    url: '/mood-tracker',
    icon: Heart,
    description: 'Log and track your daily moods'
  },
  {
    title: 'Journal',
    url: '/journal',
    icon: PenTool,
    description: 'Reflect with guided prompts'
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: TrendingUp,
    description: 'Insights into your mental health'
  },
  {
    title: 'Breathing',
    url: '/breathing',
    icon: Wind,
    description: 'Guided breathing exercises'
  },
  {
    title: 'Goals',
    url: '/goals',
    icon: Target,
    description: 'Set and track wellness goals'
  },
];

const toolsItems = [
  {
    title: 'AI Insights',
    url: '/ai-insights',
    icon: Brain,
    description: 'Personalized wellness recommendations'
  },
  {
    title: 'Mood Calendar',
    url: '/calendar',
    icon: Calendar,
    description: 'Visual mood tracking calendar'
  },
];

export function AppSidebar() {
  const { state } = useSidebar();

  return (
    <Sidebar className="border-r border-border/50 bg-card/50 backdrop-blur">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          {state === 'expanded' && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Moodly
              </h1>
              <p className="text-xs text-muted-foreground">Mental Wellness</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-soft'
                            : 'text-muted-foreground hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state === 'expanded' && (
                        <div className="flex-1">
                          <span className="font-medium">{item.title}</span>
                          <p className="text-xs opacity-60">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-soft'
                            : 'text-muted-foreground hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state === 'expanded' && (
                        <div className="flex-1">
                          <span className="font-medium">{item.title}</span>
                          <p className="text-xs opacity-60">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}