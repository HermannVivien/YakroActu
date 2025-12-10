import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleForm from './pages/ArticleForm';
import Categories from './pages/Categories';
import Pharmacies from './pages/Pharmacies';
import FlashInfo from './pages/FlashInfo';
import Users from './pages/Users';
import Comments from './pages/Comments';
import Media from './pages/Media';
import Events from './pages/Events';
import Polls from './pages/Polls';
import Promotions from './pages/Promotions';
import Titrilologie from './pages/Titrilologie';
import Settings from './pages/Settings';
import AppVersions from './pages/AppVersions';
import PushNotifications from './pages/PushNotifications';
import Banners from './pages/Banners';
import Subcategories from './pages/Subcategories';
import Tags from './pages/Tags';
import Authors from './pages/Authors';
import BreakingNews from './pages/BreakingNews';
import LiveStreaming from './pages/LiveStreaming';
import RssFeeds from './pages/RssFeeds';
import CommentFlags from './pages/CommentFlags';
import Surveys from './pages/Surveys';
import FeaturedSections from './pages/FeaturedSections';
import AdSpaces from './pages/AdSpaces';
import Roles from './pages/Roles';
import Staff from './pages/Staff';
import SportConfig from './pages/SportConfig';
import Reportages from './pages/Reportages';
import Interviews from './pages/Interviews';
import Announcements from './pages/Announcements';
import Testimonies from './pages/Testimonies';
import ForumCategories from './pages/ForumCategories';
import ForumTopics from './pages/ForumTopics';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/new" element={<ArticleForm />} />
          <Route path="articles/edit/:id" element={<ArticleForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="subcategories" element={<Subcategories />} />
          <Route path="tags" element={<Tags />} />
          <Route path="authors" element={<Authors />} />
          <Route path="breaking-news" element={<BreakingNews />} />
          <Route path="live-streaming" element={<LiveStreaming />} />
          <Route path="rss-feeds" element={<RssFeeds />} />
          <Route path="comment-flags" element={<CommentFlags />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="featured-sections" element={<FeaturedSections />} />
          <Route path="ad-spaces" element={<AdSpaces />} />
          <Route path="roles" element={<Roles />} />
          <Route path="staff" element={<Staff />} />
          <Route path="comments" element={<Comments />} />
          <Route path="media" element={<Media />} />
          <Route path="events" element={<Events />} />
          <Route path="polls" element={<Polls />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="titrilologie" element={<Titrilologie />} />
          <Route path="pharmacies" element={<Pharmacies />} />
          <Route path="flash-info" element={<FlashInfo />} />
          <Route path="users" element={<Users />} />
          <Route path="app-versions" element={<AppVersions />} />
          <Route path="push-notifications" element={<PushNotifications />} />
          <Route path="banners" element={<Banners />} />
          <Route path="settings" element={<Settings />} />
          <Route path="sport-config" element={<SportConfig />} />
          <Route path="reportages" element={<Reportages />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="testimonies" element={<Testimonies />} />
          <Route path="forum-categories" element={<ForumCategories />} />
          <Route path="forum-topics" element={<ForumTopics />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
