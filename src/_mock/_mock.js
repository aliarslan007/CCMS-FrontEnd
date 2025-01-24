import { sub } from 'date-fns';
// config
import { ASSETS_API } from 'src/config-global';
//
import {
  _ages,
  _booleans,
  _companyNames,
  _descriptions,
  _emails,
  _firstNames,
  _fullAddress,
  _fullNames,
  _id,
  _jobTitles,
  _lastNames,
  _nativeL,
  _nativeM,
  _nativeS,
  _percents,
  _phoneNumbers,
  _postTitles,
  _prices,
  _productNames,
  _ratings,
  _roles,
  _sentences,
  _taskNames,
  _tourNames,
  _types,
  _countries,
  _statuss,
} from './assets';

// ----------------------------------------------------------------------

export const _mock = {
  id: (index) => _id[index],
  time: (index) => sub(new Date(), { days: index, hours: index }),
  boolean: (index) => _booleans[index],
  role: (index) => _roles[index],

  // Text
  taskNames: (index) => _taskNames[index],
  postTitle: (index) => _postTitles[index],
  jobTitle: (index) => _jobTitles[index],
  tourName: (index) => _tourNames[index],
  productName: (index) => _productNames[index],
  sentence: (index) => _sentences[index],
  description: (index) => _descriptions[index],
  type: (index) => _types[index],
  country: (index) => _countries[index],
  status: (index) => _statuss[index],
  // Contact
  email: (index) => _emails[index],
  phoneNumber: (index) => _phoneNumbers[index],
  fullAddress: (index) => _fullAddress[index],

  // Name
  firstName: (index) => _firstNames[index],
  lastName: (index) => _lastNames[index],
  fullName: (index) => _fullNames[index],
  companyName: (index) => _companyNames[index],
  // Number
  number: {
    percent: (index) => _percents[index],
    rating: (index) => _ratings[index],
    age: (index) => _ages[index],
    price: (index) => _prices[index],
    nativeS: (index) => _nativeS[index],
    nativeM: (index) => _nativeM[index],
    nativeL: (index) => _nativeL[index],
  },
  // Image
  image: {
    cover: (index) => `${ASSETS_API}/assets/images/cover/cover_${index + 1}.jpg`,
    avatar: (index) => `${ASSETS_API}/assets/images/avatar/avatar_${index + 1}.jpg`,
    travel: (index) => `${ASSETS_API}/assets/images/travel/travel_${index + 1}.jpg`,
    company: (index) => `${ASSETS_API}/assets/images/company/company_${index + 1}.png`,
    product: (index) => `${ASSETS_API}/assets/images/travel/travel_${index + 1}.jpg`,
    portrait: (index) => `${ASSETS_API}/assets/images/portrait/portrait_${index + 1}.jpg`,
  },
};
