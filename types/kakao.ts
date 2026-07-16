export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoMapInstance {
  setCenter(position: KakaoLatLng): void;
  panTo(position: KakaoLatLng): void;
  setLevel(level: number): void;
  relayout(): void;
}

export interface KakaoMarkerInstance {
  setMap(map: KakaoMapInstance | null): void;
  setPosition(position: KakaoLatLng): void;
}

export interface KakaoPlaceResult {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
}

export interface KakaoAddressResult {
  address: {
    address_name: string;
  } | null;
  road_address: {
    address_name: string;
  } | null;
}

export interface KakaoPagination {
  current: number;
  last: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage(): void;
  prevPage(): void;
  gotoPage(page: number): void;
}

export interface KakaoPlacesService {
  keywordSearch(
    keyword: string,
    callback: (
      result: KakaoPlaceResult[],
      status: string,
      pagination: KakaoPagination,
    ) => void,
    options?: {
      location?: KakaoLatLng;
      radius?: number;
      size?: number;
      page?: number;
      sort?: string;
      useMapBounds?: boolean;
    },
  ): void;
}

export interface KakaoGeocoderService {
  coord2Address(
    lng: number,
    lat: number,
    callback: (result: KakaoAddressResult[], status: string) => void,
  ): void;
}

export interface KakaoMapsNamespace {
  load(callback: () => void): void;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: {
    position: KakaoLatLng;
    map?: KakaoMapInstance;
  }) => KakaoMarkerInstance;
  services: {
    Places: new (map?: KakaoMapInstance) => KakaoPlacesService;
    Geocoder: new () => KakaoGeocoderService;
    Status: {
      OK: string;
      ZERO_RESULT: string;
      ERROR: string;
    };
    SortBy: {
      ACCURACY: string;
      DISTANCE: string;
    };
  };
}

export interface KakaoGlobal {
  maps: KakaoMapsNamespace;
}

declare global {
  interface Window {
    kakao?: KakaoGlobal;
  }
}
