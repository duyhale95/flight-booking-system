import { mockData } from '../data/mockData';

class AviationStackService {
  
  /**
   * Tìm kiếm sân bay theo tên hoặc IATA code
   */
  async searchAirports(query = '') {
    if (!query || query.length < 2) {
      return { 
        data: mockData.airports.slice(0, 10)
      };
    }
    
    const searchQuery = query.toLowerCase().trim();
    
    // Bản đồ mapping tên thành phố tiếng Việt
    const cityAliases = {
      'hà nội': ['hanoi', 'ha noi', 'nội bài', 'noi bai', 'han'],
      'hanoi': ['hà nội', 'ha noi', 'nội bài', 'noi bai', 'han'],
      'ha noi': ['hà nội', 'hanoi', 'nội bài', 'noi bai', 'han'],
      'tp hồ chí minh': ['saigon', 'sài gòn', 'sai gon', 'ho chi minh', 'hcmc', 'sgn', 'tân sơn nhất'],
      'hồ chí minh': ['saigon', 'sài gòn', 'sai gon', 'ho chi minh', 'hcmc', 'sgn'],
      'sài gòn': ['saigon', 'sai gon', 'ho chi minh', 'hcmc', 'sgn', 'tân sơn nhất'],
      'saigon': ['sài gòn', 'sai gon', 'ho chi minh', 'hcmc', 'sgn'],
      'đà nẵng': ['danang', 'da nang', 'dad'],
      'danang': ['đà nẵng', 'da nang', 'dad'],
      'da nang': ['đà nẵng', 'danang', 'dad'],
      'nha trang': ['cam ranh', 'cxr'],
      'cam ranh': ['nha trang', 'cxr'],
      'phú quốc': ['phu quoc', 'pqc'],
      'phu quoc': ['phú quốc', 'pqc'],
      'bangkok': ['bkk', 'thailand'],
      'singapore': ['sin', 'changi'],
      'kuala lumpur': ['kul', 'malaysia']
    };
    
    const filteredAirports = mockData.airports.filter(airport => {
      const airportName = airport.airport_name.toLowerCase();
      const iataCode = airport.iata_code.toLowerCase();
      const countryName = airport.country_name.toLowerCase();
      
      // Tìm kiếm trực tiếp
      if (airportName.includes(searchQuery) ||
          iataCode.includes(searchQuery) ||
          countryName.includes(searchQuery)) {
        return true;
      }
      
      // Tìm kiếm qua aliases
      for (const [key, aliases] of Object.entries(cityAliases)) {
        if (searchQuery.includes(key) || aliases.some(alias => searchQuery.includes(alias))) {
          if (airportName.includes(key) || 
              aliases.some(alias => airportName.includes(alias) || iataCode === alias.toUpperCase())) {
            return true;
          }
        }
      }
      
      return false;
    });
    
    // Sắp xếp ưu tiên: sân bay Việt Nam trước, sau đó theo IATA code
    const sortedAirports = filteredAirports.sort((a, b) => {
      // Ưu tiên sân bay Việt Nam
      if (a.country_iso2 === 'VN' && b.country_iso2 !== 'VN') return -1;
      if (a.country_iso2 !== 'VN' && b.country_iso2 === 'VN') return 1;
      
      // Ưu tiên IATA code match
      if (a.iata_code.toLowerCase().includes(searchQuery)) return -1;
      if (b.iata_code.toLowerCase().includes(searchQuery)) return 1;
      
      return 0;
    });
    
    return {
      pagination: {
        limit: 25,
        offset: 0,
        count: sortedAirports.length,
        total: sortedAirports.length
      },
      data: sortedAirports.slice(0, 10)
    };
  }

  /**
   * Lấy thông tin sân bay theo IATA code
   */
  async getAirportByIata(iataCode) {
    const airport = mockData.airports.find(
      airport => airport.iata_code === iataCode.toUpperCase()
    );
    
    return airport ? { data: [airport] } : { data: [] };
  }

  /**
   * Lấy thông tin hãng hàng không
   */
  async getAirlines(iataCode = null) {
    if (iataCode) {
      const airline = mockData.airlines.find(
        airline => airline.iata_code === iataCode.toUpperCase()
      );
      return airline ? { data: [airline] } : { data: [] };
    }
    
    return {
      pagination: {
        limit: 25,
        offset: 0,
        count: mockData.airlines.length,
        total: mockData.airlines.length
      },
      data: mockData.airlines
    };
  }

  /**
   * Kiểm tra tuyến bay có tồn tại
   */
  async getRoutes(departureIata, arrivalIata) {
    if (!departureIata || !arrivalIata) {
      return { data: [] };
    }

    const availableRoutes = mockData.routes.filter(route => 
      route.departure.iata === departureIata.toUpperCase() &&
      route.arrival.iata === arrivalIata.toUpperCase()
    );

    // Nếu không có route, tạo route giả lập
    if (availableRoutes.length === 0) {
      const mockRoute = {
        departure: {
          airport: `${departureIata} Airport`,
          timezone: "Asia/Ho_Chi_Minh",
          iata: departureIata.toUpperCase(),
          icao: this.getIcaoFromIata(departureIata),
          terminal: "1",
          time: "08:00:00"
        },
        arrival: {
          airport: `${arrivalIata} Airport`,
          timezone: "Asia/Ho_Chi_Minh",
          iata: arrivalIata.toUpperCase(),
          icao: this.getIcaoFromIata(arrivalIata),
          terminal: "1", 
          time: "10:00:00"
        },
        airline: {
          name: "Vietnam Airlines",
          callsign: "VIETNAM",
          iata: "VN",
          icao: "HVN"
        },
        flight: {
          number: "211"
        }
      };
      
      return {
        pagination: {
          limit: 25,
          offset: 0,
          count: 1,
          total: 1
        },
        data: [mockRoute]
      };
    }
    
    return {
      pagination: {
        limit: 25,
        offset: 0,
        count: availableRoutes.length,
        total: availableRoutes.length
      },
      data: availableRoutes
    };
  }

  /**
   * Lấy lịch trình chuyến bay
   */
  async getFlightSchedules(params = {}) {
    const {
      dep_iata,
      arr_iata,
      flight_date,
      airline_iata,
      limit = 25,
      offset = 0
    } = params;

    let schedules = [...mockData.flightSchedules];

    // Filter theo sân bay đi
    if (dep_iata) {
      schedules = schedules.filter(flight => 
        flight.departure.iataCode === dep_iata.toUpperCase()
      );
    }

    // Filter theo sân bay đến
    if (arr_iata) {
      schedules = schedules.filter(flight => 
        flight.arrival.iataCode === arr_iata.toUpperCase()
      );
    }

    // Filter theo hãng hàng không
    if (airline_iata) {
      schedules = schedules.filter(flight => 
        flight.airline.iataCode === airline_iata.toUpperCase()
      );
    }

    // Nếu không có chuyến bay, tạo chuyến bay giả lập
    if (schedules.length === 0 && dep_iata && arr_iata) {
      schedules = this.generateMockFlights(dep_iata, arr_iata, flight_date);
    }

    const paginatedSchedules = schedules.slice(offset, offset + limit);

    return {
      pagination: {
        limit,
        offset,
        count: paginatedSchedules.length,
        total: schedules.length
      },
      data: paginatedSchedules
    };
  }

  /**
   * Tạo chuyến bay giả lập cho tuyến
   */
  generateMockFlights(depIata, arrIata, flightDate) {
    const airlines = [
      { iata: "VN", icao: "HVN", name: "Vietnam Airlines" },
      { iata: "VJ", icao: "VJC", name: "VietJet Air" },
      { iata: "QH", icao: "BAV", name: "Bamboo Airways" },
      { iata: "BL", icao: "JEC", name: "Jetstar Pacific" }
    ];

    const times = [
      { dep: "06:00:00", arr: "08:15:00" },
      { dep: "08:30:00", arr: "10:45:00" },
      { dep: "10:45:00", arr: "13:00:00" },
      { dep: "14:20:00", arr: "16:35:00" }
    ];

    return airlines.map((airline, index) => ({
      airline: {
        iataCode: airline.iata,
        icaoCode: airline.icao,
        name: airline.name
      },
      departure: {
        actualRunway: null,
        actualTime: null,
        baggage: null,
        delay: null,
        estimatedRunway: null,
        estimatedTime: `${flightDate}T${times[index].dep}`,
        gate: `A${index + 1}`,
        iataCode: depIata.toUpperCase(),
        icaoCode: this.getIcaoFromIata(depIata),
        scheduledTime: `${flightDate}T${times[index].dep}`,
        terminal: "1"
      },
      arrival: {
        actualRunway: null,
        actualTime: null,
        baggage: `${index + 1}`,
        delay: null,
        estimatedRunway: null,
        estimatedTime: `${flightDate}T${times[index].arr}`,
        gate: `B${index + 1}`,
        iataCode: arrIata.toUpperCase(),
        icaoCode: this.getIcaoFromIata(arrIata),
        scheduledTime: `${flightDate}T${times[index].arr}`,
        terminal: "1"
      },
      flight: {
        iataNumber: `${airline.iata}${200 + index}`,
        icaoNumber: `${airline.icao}${200 + index}`,
        number: `${200 + index}`
      },
      status: "scheduled",
      type: "departure",
      // Thêm thông tin bổ sung cho UI
      price: {
        economy: 1200000 + (index * 100000),
        business: 3600000 + (index * 300000)
      },
      duration: "2h 15m",
      aircraft: "Airbus A320"
    }));
  }

  /**
   * Utility method để lấy ICAO từ IATA
   */
  getIcaoFromIata(iata) {
    const mapping = {
      'VN': 'HVN', 'VJ': 'VJC', 'QH': 'BAV', 'BL': 'JEC',
      'HAN': 'VVNB', 'SGN': 'VVTS', 'DAD': 'VVDN',
      'CXR': 'VVCR', 'PQC': 'VVPQ', 'VII': 'VVVH',
      'VCS': 'VVCS', 'VCA': 'VVCM', 'HUI': 'VVPB',
      'BKK': 'VTBS', 'SIN': 'WSSS', 'KUL': 'WMKK'
    };
    return mapping[iata?.toUpperCase()] || (iata?.toUpperCase() + 'X');
  }
}

export default new AviationStackService(); 