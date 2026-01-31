import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiFolder,
  FiMail,
  FiArrowRight,
  FiTrendingUp,
  FiActivity,
  FiClock,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { servicesAPI, projectsAPI, contactAPI } from '../../services/api';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    services: 0,
    projects: 0,
    messages: 0,
    unreadMessages: 0,
    activeServices: 0,
    activeProjects: 0,
  });
  const [projectsData, setProjectsData] = useState([]);
  const [contactsData, setContactsData] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fire-themed colors for charts
  const COLORS = ['#f97316', '#ea580c', '#c2410c', '#fb923c', '#fdba74', '#fed7aa', '#9a3412'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, projectsRes, contactsRes] = await Promise.all([
          servicesAPI.getAll(),
          projectsAPI.getAll(),
          contactAPI.getAll(),
        ]);

        const services = servicesRes.data.data || [];
        const projects = projectsRes.data.data || [];
        const contacts = contactsRes.data.data || [];

        // Calculate statistics
        const unreadCount = contacts.filter((c) => !c.isRead).length;
        const activeServices = services.filter((s) => s.isActive).length;
        const activeProjects = projects.filter((p) => p.isActive).length;

        setStats({
          services: services.length,
          projects: projects.length,
          messages: contacts.length,
          unreadMessages: unreadCount,
          activeServices,
          activeProjects,
        });

        // Process projects by category for chart
        const categoryCount = {};
        projects.forEach((project) => {
          categoryCount[project.category] = (categoryCount[project.category] || 0) + 1;
        });

        const projectsChartData = Object.entries(categoryCount).map(([name, value]) => ({
          name,
          value,
        }));

        setProjectsData(projectsChartData);

        // Process contacts over time (last 7 days)
        const last7Days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const count = contacts.filter((c) => {
            const contactDate = new Date(c.createdAt);
            return contactDate.toDateString() === date.toDateString();
          }).length;
          last7Days.push({ date: dateStr, messages: count });
        }

        setContactsData(last7Days);

        // Get recent contacts (last 5)
        const recent = contacts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentContacts(recent);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Services',
      value: stats.services,
      subtitle: `${stats.activeServices} active`,
      icon: FiShield,
      color: 'bg-gradient-to-br from-primary-500 to-primary-700',
      link: '/admin/services',
      trend: '+12%',
    },
    {
      title: 'Total Projects',
      value: stats.projects,
      subtitle: `${stats.activeProjects} active`,
      icon: FiFolder,
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      link: '/admin/projects',
      trend: '+8%',
    },
    {
      title: 'Messages',
      value: stats.messages,
      subtitle: `${stats.unreadMessages} unread`,
      icon: FiMail,
      color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
      link: '/admin/contacts',
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : null,
      trend: '+5%',
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      subtitle: `${((stats.activeServices / stats.services) * 100 || 0).toFixed(0)}% of total`,
      icon: FiActivity,
      color: 'bg-gradient-to-br from-red-500 to-red-700',
      link: '/admin/services',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={card.link}
              className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg shadow-lg`}>
                  <card.icon className="text-white" size={24} />
                </div>
                {card.badge && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse">
                    {card.badge} new
                  </span>
                )}
                {card.trend && (
                  <div className="flex items-center text-green-600 text-xs font-semibold">
                    <FiTrendingUp className="mr-1" size={14} />
                    {card.trend}
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{card.value}</h3>
              <p className="text-sm font-semibold text-gray-900 mb-1">{card.title}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
              <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                View details <FiArrowRight className="ml-1" size={14} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Category - Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Projects by Category</h2>
              <p className="text-sm text-gray-500 mt-1">Distribution across all categories</p>
            </div>
            <FiFolder className="text-primary-500" size={24} />
          </div>
          {projectsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No project data available
            </div>
          )}
        </motion.div>

        {/* Messages Over Time - Area Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Messages Trend</h2>
              <p className="text-sm text-gray-500 mt-1">Last 7 days activity</p>
            </div>
            <FiMail className="text-primary-500" size={24} />
          </div>
          {contactsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={contactsData}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No message data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Projects by Category - Bar Chart */}
      {projectsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Projects Distribution</h2>
              <p className="text-sm text-gray-500 mt-1">Number of projects per category</p>
            </div>
            <FiActivity className="text-primary-500" size={24} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#666"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]}>
                {projectsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
              <p className="text-sm text-gray-500 mt-1">Latest contact form submissions</p>
            </div>
            <Link
              to="/admin/contacts"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
            >
              View all <FiArrowRight className="ml-1" size={14} />
            </Link>
          </div>
          {recentContacts.length > 0 ? (
            <div className="space-y-4">
              {recentContacts.map((contact, index) => (
                <div
                  key={contact._id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      {!contact.isRead && (
                        <span className="bg-primary-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{contact.subject}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <FiMail className="mr-1" size={12} />
                        {contact.email}
                      </span>
                      <span className="flex items-center">
                        <FiClock className="mr-1" size={12} />
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <FiMail className="mx-auto mb-2" size={32} />
              <p>No recent messages</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/services"
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg hover:from-primary-100 hover:to-primary-200 transition-all group"
            >
              <div className="p-2 bg-primary-500 rounded-lg group-hover:bg-primary-600 transition-colors">
                <FiShield className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Add Service</p>
                <p className="text-xs text-gray-500">Create a new service</p>
              </div>
              <FiArrowRight className="text-primary-600" size={18} />
            </Link>

            <Link
              to="/admin/projects"
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all group"
            >
              <div className="p-2 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors">
                <FiFolder className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Add Project</p>
                <p className="text-xs text-gray-500">Create a new project</p>
              </div>
              <FiArrowRight className="text-orange-600" size={18} />
            </Link>

            <Link
              to="/admin/contacts"
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all group"
            >
              <div className="p-2 bg-yellow-500 rounded-lg group-hover:bg-yellow-600 transition-colors">
                <FiMail className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">View Messages</p>
                <p className="text-xs text-gray-500">
                  {stats.unreadMessages > 0
                    ? `${stats.unreadMessages} unread messages`
                    : 'All messages read'}
                </p>
              </div>
              <FiArrowRight className="text-yellow-600" size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;
