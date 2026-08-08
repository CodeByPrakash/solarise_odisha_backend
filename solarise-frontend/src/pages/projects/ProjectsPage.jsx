import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { projectService } from '../../services/api';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredProjects = projects.filter((p) =>
    (p.registration_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.consumer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.current_status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solar Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Track installations, approval desks, and 40+ status transitions</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-64 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            variant="primary"
            onClick={() => navigate('/projects/new')}
            className="px-4 py-2 text-sm"
          >
            + New Project
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchProjects} className="underline text-amber-900 font-semibold ml-4">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 px-4">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-base font-semibold text-gray-900">No Solar Projects Found</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first solar project record to start tracking status history.</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => navigate('/projects/new')}>
                + Create Project
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.HeaderCell>Registration No.</Table.HeaderCell>
              <Table.HeaderCell>Consumer</Table.HeaderCell>
              <Table.HeaderCell>Capacity (kW)</Table.HeaderCell>
              <Table.HeaderCell>Pipeline Status</Table.HeaderCell>
              <Table.HeaderCell>Created At</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>
            <Table.Body>
              {filteredProjects.map((project) => (
                <Table.Row key={project.id}>
                  <Table.Cell className="font-semibold text-gray-900">{project.registration_no || `PROJ-${project.id}`}</Table.Cell>
                  <Table.Cell>{project.consumer_name || `Consumer #${project.consumer_id}`}</Table.Cell>
                  <Table.Cell>{project.capacity_kw} kW</Table.Cell>
                  <Table.Cell>
                    <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-emerald-50 text-emerald-700 capitalize">
                      {(project.current_status || 'new_registration').replace(/_/g, ' ')}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</Table.Cell>
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