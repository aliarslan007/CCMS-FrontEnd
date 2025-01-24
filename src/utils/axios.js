import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  response => response,
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {

  register:{
    url:'api/register'
  },
  
  login:{
    url: 'api/login'
  },

  password: {
    verify:'/api/verify-password'
  },

  company: {
    details: '/api/companies/1',
  },
  user:{
    create:'/api/profiles',
  },
  profile:{
    details: (uuid) => `/api/profiles/${uuid}`,
  },

  admin:{
    details:'/api/users',
  },

  companies:{
    accounts:'/api/company-accounts',
  },

  details:{
    accounts: (uuid) => `/api/company-accounts/${uuid}`,
  },

  complete:{
    accounts: (id) => `/api/companyaccount/${id}`,
  },

  all:{
    company: '/api/allcompanyaccount',
  },

  filter:{
  company :'/api/company/filter',
  },

  // Company Contact Endpoints

  contact:{
    details: '/api/company-contacts'
  },

  solo:{
    details: (id) => `/api/company-contacts/${id}`,
  },

  inactive: {
    profile: (id) => `/api/profiles/inactive/${id}`,
    comapany: (id) => `/api/company-accounts/inactive/${id}`,
    contact: (id) => `/api/company-contacts/inactive/${id}`,
    delete: (id) => `/api/inactive-profiles-delete/${id}`,
  },

  restores: {
    details:`/api/inactive-profiles`,
  },

  restore: {
    profile: (id) => `/api/inactive-profiles/restore/${id}`,
  },

  markdelete: {
    marked_profiles: `/api/mark-profiles`,
    get_marked:(id) => `/api/mark-delete/${id}`,
    marked: (id) => `/api/mark-delete/${id}`,
    confirmdelete: (id) => `/api/permanent-delete/${id}`,
  },


  follow_up:{
    details: (id) => `/api/follow-up/${id}`,
  },

  submit:{
    follow_up: '/api/follow-up'
  },

  change: {
    password:`/api/password-change`,
  },

  assigned:{
    agent: 'api/permission_control'
  },

  files: {
    list: (id) => `/api/files?company_contacts_id=${id}`,
  },

  follow_ups: {
    date: `/api/get_follow_ups`,
  },


  export: {
    function:`/api/export-record`,
  },

  import: {
    function:`/api/import-record`,
  },

  award: {
    function:`/api/awards`,
  },

  state: {
    function:`/api/states`,
  },

  search: {
    company:`/api/company-search`,
    contact:`/api/search`,
    profile:'/api/profile-search'
  },

  file: {
    upload:`/api/upload-file`,
  },

  forgot: {
    password: `/api/forgot-password`,
  },

};
