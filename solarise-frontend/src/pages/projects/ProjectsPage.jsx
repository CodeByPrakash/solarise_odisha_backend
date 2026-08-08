import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { projectService } from '../../services/api';
import StatusTag from '../../components/tags/StatusTag';
import HashtagTagInput from '../../components/tags/HashtagTagInput';

const QUICK_TAG_FILTERS = [
  'all',
  'new_registration',
  'doc_uploaded',
  'doc_verified',
  'action_required',
  'work_in_progress',
  'installation_done',
  'meter_installed',
  'project_commissioned',
];

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Tag Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectService.getAll();
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('API error fetching projects:', err);
      setError(err.response?.data?.error || 'Could not fetch projects from backend API');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagFilterClick = (tag) => {
    if (activeTagFilter === tag) {
      setActiveTagFilter('all');
    } else {
      setActiveTagFilter(tag);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const status = p.current_status || 'new_registration';
    const regNo = (p.registration_no || '').toLowerCase();
    const consumerName = (p.consumer_name || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    // Check Tag Quick Filter
    if (activeTagFilter !== 'all' && status !== activeTagFilter) {
      return false;
    }

    // Check Hashtag search query (e.g. #doc_verified or general text search)
    if (query.startsWith('#')) {
      const cleanTag = query.slice(1).trim();
      return status.toLowerCase().includes(cleanTag);
    }

    return regNo.includes(query) || consumerName.includes(query) || status.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solar Projects Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">Track installations, status tags (#), and 40+ lifecycle transition states</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={() => navigate('/projects/new')}
            className="px-4 py-2 text-xs font-semibold shadow-sm"
          >
            + New Project
          </Button>
        </div>
      </div>

      {/* Hashtag Tag Quick Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Filter by Tag:</span>
            <span className="text-[11px] text-emerald-600 font-mono">Type # in search or select pill below</span>
          </div>

          <div className="w-full sm:w-80">
            <HashtagTagInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search or type # for status tags..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1">
          {QUICK_TAG_FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagFilterClick(tag)}
              className={`shrink-0 transition ${
                activeTagFilter === tag ? 'ring-2 ring-emerald-500 ring-offset-1 rounded-full' : ''
              }`}
            >
              {tag === 'all' ? (
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  activeTagFilter === 'all' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}>
                  All Projects ({projects.length})
                </span>
              ) : (
                <StatusTag status={tag} size="sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchProjects} className="underline text-amber-900 font-semibold ml-4">Retry</button>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">No Matching Solar Projects Found</h3>
            <p className="text-sm text-gray-500 mt-1">Try searching with a different #status tag or clear filters.</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => { setSearchTerm(''); setActiveTagFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.HeaderCell>Registration No.</Table.HeaderCell>
              <Table.HeaderCell>Consumer</Table.HeaderCell>
              <Table.HeaderCell>Capacity</Table.HeaderCell>
              <Table.HeaderCell>Project Status Tag (#)</Table.HeaderCell>
              <Table.HeaderCell>Created At</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {filteredProjects.map((project) => (
                <Table.Row key={project.id}>
                  <Table.Cell className="font-semibold text-gray-900">
                    {project.registration_no || `PROJ-${project.id}`}
                  </Table.Cell>
                  <Table.Cell className="font-medium text-gray-800">
                    {project.consumer_name || `Consumer #${project.consumer_id}`}
                  </Table.Cell>
                  <Table.Cell className="font-mono text-xs font-semibold text-emerald-700">
                    {project.capacity_kw} kW
                  </Table.Cell>
                  <Table.Cell>
                    <StatusTag
                      status={project.current_status || 'new_registration'}
                      onClick={(t) => setSearchTerm(`#${t}`)}
                    />
                  </Table.Cell>
                  <Table.Cell className="text-xs text-gray-500 font-mono">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Pipeline
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;