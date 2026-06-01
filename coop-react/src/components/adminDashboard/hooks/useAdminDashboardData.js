import { useCallback, useState } from 'react';
import api from '../../../api/axios';
import {
  API_ROUTES,
  EMPTY_CURRENT_TEMPLATES,
} from '../constants';

const normalizeDateOnly = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const [datePart] = String(value).split('T');
  const normalizedDate = new Date(`${datePart}T00:00:00`);

  return Number.isNaN(normalizedDate.getTime()) ? null : normalizedDate;
};

export default function useAdminDashboardData({ navigate, onUnauthorized }) {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [utsReports, setUtsReports] = useState([]);
  const [finalReports, setFinalReports] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [currentTemplates, setCurrentTemplates] = useState(EMPTY_CURRENT_TEMPLATES);
  const [, setLoadingVacancies] = useState(false);

  const loadVacancies = useCallback(async () => {
    const response = await api.get(API_ROUTES.vacancies);
    const allVacancies = response.data;
    const today = normalizeDateOnly(new Date());

    const activeVacancies = allVacancies.filter((job) => {
      const expiryDate = normalizeDateOnly(job.expires_at);
      return !expiryDate || expiryDate >= today;
    });

    setVacancies(activeVacancies);
  }, []);

  const fetchAdminData = useCallback(async () => {
    if (!localStorage.getItem('token')) return navigate('/login');

    try {
      const response = await api.get(API_ROUTES.me);
      if (!response.data.is_staff) return navigate('/dashboard');

      setAdminData(response.data);

      const [
        usersRes,
        placementsRes,
        evalsRes,
        monthlyRes,
        utsRes,
        finalRes,
        certRes,
        templatesRes,
        weeklyRes,
        appsRes,
        industriesRes,
      ] = await Promise.all([
        api.get(API_ROUTES.users),
        api.get(API_ROUTES.placements),
        api.get(API_ROUTES.evaluations),
        api.get(API_ROUTES.monthlyReports),
        api.get(API_ROUTES.utsReports),
        api.get(API_ROUTES.finalReports),
        api.get(API_ROUTES.certificates),
        api.get(API_ROUTES.templates),
        api.get(API_ROUTES.weeklyReports),
        api.get(API_ROUTES.applications),
        api.get(API_ROUTES.industries),
      ]);

      const allUsers = usersRes.data;
      setStudents(allUsers.filter((user) => !user.is_staff && user.is_active));
      setPendingUsers(allUsers.filter((user) => !user.is_staff && !user.is_active));
      setPlacements(placementsRes.data);
      setEvaluations(evalsRes.data);
      setMonthlyReports(monthlyRes.data);
      setUtsReports(utsRes.data);
      setFinalReports(finalRes.data);
      setCertificates(certRes.data);
      setWeeklyReports(weeklyRes.data);
      setApplications(appsRes.data);
      setIndustries(industriesRes.data);
      await loadVacancies();

      if (templatesRes.data && !templatesRes.data.detail) {
        setCurrentTemplates(templatesRes.data);
      }
    } catch {
      onUnauthorized();
    } finally {
      setLoading(false);
    }
  }, [loadVacancies, navigate, onUnauthorized]);

  const fetchVacancies = useCallback(async () => {
    setLoadingVacancies(true);

    try {
      await loadVacancies();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingVacancies(false);
    }
  }, [loadVacancies]);

  return {
    adminData,
    loading,
    students,
    pendingUsers,
    placements,
    evaluations,
    industries,
    monthlyReports,
    utsReports,
    finalReports,
    certificates,
    weeklyReports,
    vacancies,
    setVacancies,
    applications,
    setApplications,
    currentTemplates,
    setCurrentTemplates,
    fetchAdminData,
    fetchVacancies,
  };
}
