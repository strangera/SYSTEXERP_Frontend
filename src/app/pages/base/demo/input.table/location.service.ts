import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface LocationForm {
  LOCATION_No: string,
  BUILDING_NO?: string,
  FLOOR_NO?: string,
  AREA_NO?: string
}

export interface LocationData {
  LOCATION_No: string;
  BUILDING_NO: string;
  FLOOR_NO: string;
  AREA_NO: string;
  GROSS_SPACE: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private mockLocations: LocationData[] = [
    { LOCATION_No: '16Z9999', BUILDING_NO: '01', FLOOR_NO: '16F', AREA_NO: 'Z', GROSS_SPACE: 99 },
    { LOCATION_No: '1999990', BUILDING_NO: '02', FLOOR_NO: '1F', AREA_NO: 'A', GROSS_SPACE: 19 },
    { LOCATION_No: 'B1B02', BUILDING_NO: '01', FLOOR_NO: 'B1', AREA_NO: 'B', GROSS_SPACE: 42.3 },
    { LOCATION_No: 'A0001', BUILDING_NO: '02', FLOOR_NO: '1F', AREA_NO: 'B', GROSS_SPACE: 55 },
    { LOCATION_No: 'Z9998', BUILDING_NO: '01', FLOOR_NO: '16F', AREA_NO: 'A', GROSS_SPACE: 120 },
    { LOCATION_No: 'C2345', BUILDING_NO: '03', FLOOR_NO: '2F', AREA_NO: 'C', GROSS_SPACE: 78.5 },
    { LOCATION_No: 'D5678', BUILDING_NO: '01', FLOOR_NO: '3F', AREA_NO: 'D', GROSS_SPACE: 30 },
    { LOCATION_No: 'E8901', BUILDING_NO: '04', FLOOR_NO: 'GF', AREA_NO: 'E', GROSS_SPACE: 92 },
    { LOCATION_No: 'F1234', BUILDING_NO: '02', FLOOR_NO: '4F', AREA_NO: 'F', GROSS_SPACE: 61.2 },
    { LOCATION_No: 'G5679', BUILDING_NO: '03', FLOOR_NO: 'B2', AREA_NO: 'G', GROSS_SPACE: 25.8 },
    { LOCATION_No: 'H8902', BUILDING_NO: '01', FLOOR_NO: '5F', AREA_NO: 'H', GROSS_SPACE: 88 },
    { LOCATION_No: 'I1235', BUILDING_NO: '04', FLOOR_NO: '1F', AREA_NO: 'I', GROSS_SPACE: 45 },
    { LOCATION_No: 'J5680', BUILDING_NO: '02', FLOOR_NO: '6F', AREA_NO: 'J', GROSS_SPACE: 71.9 },
    { LOCATION_No: 'K8903', BUILDING_NO: '03', FLOOR_NO: '3F', AREA_NO: 'K', GROSS_SPACE: 33.7 },
    { LOCATION_No: 'L1236', BUILDING_NO: '01', FLOOR_NO: '7F', AREA_NO: 'L', GROSS_SPACE: 95 },
    { LOCATION_No: 'M5681', BUILDING_NO: '04', FLOOR_NO: '2F', AREA_NO: 'M', GROSS_SPACE: 50 },
    { LOCATION_No: 'N8904', BUILDING_NO: '02', FLOOR_NO: '8F', AREA_NO: 'N', GROSS_SPACE: 79 },
    { LOCATION_No: 'O1237', BUILDING_NO: '03', FLOOR_NO: '4F', AREA_NO: 'O', GROSS_SPACE: 38 },
    { LOCATION_No: 'P5682', BUILDING_NO: '01', FLOOR_NO: '9F', AREA_NO: 'P', GROSS_SPACE: 102 },
    { LOCATION_No: 'Q8905', BUILDING_NO: '04', FLOOR_NO: '3F', AREA_NO: 'Q', GROSS_SPACE: 65 },
    { LOCATION_No: 'R1238', BUILDING_NO: '02', FLOOR_NO: '10F', AREA_NO: 'R', GROSS_SPACE: 81 },
    { LOCATION_No: 'S5683', BUILDING_NO: '03', FLOOR_NO: '5F', AREA_NO: 'S', GROSS_SPACE: 41 },
    { LOCATION_No: 'T8906', BUILDING_NO: '01', FLOOR_NO: '11F', AREA_NO: 'T', GROSS_SPACE: 110 },
    { LOCATION_No: 'U1239', BUILDING_NO: '04', FLOOR_NO: '4F', AREA_NO: 'U', GROSS_SPACE: 70 },
    { LOCATION_No: 'V5684', BUILDING_NO: '02', FLOOR_NO: '12F', AREA_NO: 'V', GROSS_SPACE: 85 },
    { LOCATION_No: 'W8907', BUILDING_NO: '03', FLOOR_NO: '6F', AREA_NO: 'W', GROSS_SPACE: 48 },
    { LOCATION_No: 'X1240', BUILDING_NO: '01', FLOOR_NO: '13F', AREA_NO: 'X', GROSS_SPACE: 115 },
    { LOCATION_No: 'Y5685', BUILDING_NO: '04', FLOOR_NO: '5F', AREA_NO: 'Y', GROSS_SPACE: 75 },
    { LOCATION_No: 'Z8908', BUILDING_NO: '02', FLOOR_NO: '14F', AREA_NO: 'Z', GROSS_SPACE: 90 },
    { LOCATION_No: 'AA001', BUILDING_NO: '03', FLOOR_NO: '7F', AREA_NO: 'AA', GROSS_SPACE: 52 },
    { LOCATION_No: 'BB002', BUILDING_NO: '01', FLOOR_NO: '15F', AREA_NO: 'BB', GROSS_SPACE: 125 },
    { LOCATION_No: 'CC003', BUILDING_NO: '04', FLOOR_NO: '6F', AREA_NO: 'CC', GROSS_SPACE: 80 },
    { LOCATION_No: 'DD004', BUILDING_NO: '02', FLOOR_NO: '16F', AREA_NO: 'DD', GROSS_SPACE: 93 },
    { LOCATION_No: 'EE005', BUILDING_NO: '03', FLOOR_NO: '8F', AREA_NO: 'EE', GROSS_SPACE: 58 },
    { LOCATION_No: 'FF006', BUILDING_NO: '01', FLOOR_NO: '17F', AREA_NO: 'FF', GROSS_SPACE: 130 },
    { LOCATION_No: 'GG007', BUILDING_NO: '04', FLOOR_NO: '7F', AREA_NO: 'GG', GROSS_SPACE: 87 },
    { LOCATION_No: 'HH008', BUILDING_NO: '02', FLOOR_NO: '18F', AREA_NO: 'HH', GROSS_SPACE: 98 },
    { LOCATION_No: 'II009', BUILDING_NO: '03', FLOOR_NO: '9F', AREA_NO: 'II', GROSS_SPACE: 62 },
    { LOCATION_No: 'JJ010', BUILDING_NO: '01', FLOOR_NO: '19F', AREA_NO: 'JJ', GROSS_SPACE: 135 },
    { LOCATION_No: 'KK011', BUILDING_NO: '04', FLOOR_NO: '8F', AREA_NO: 'KK', GROSS_SPACE: 91 },
    { LOCATION_No: 'LL012', BUILDING_NO: '02', FLOOR_NO: '20F', AREA_NO: 'LL', GROSS_SPACE: 105 },
    { LOCATION_No: 'MM013', BUILDING_NO: '03', FLOOR_NO: '10F', AREA_NO: 'MM', GROSS_SPACE: 68 },
    { LOCATION_No: 'NN014', BUILDING_NO: '01', FLOOR_NO: '21F', AREA_NO: 'NN', GROSS_SPACE: 140 },
    { LOCATION_No: 'OO015', BUILDING_NO: '04', FLOOR_NO: '9F', AREA_NO: 'OO', GROSS_SPACE: 96 },
    { LOCATION_No: 'PP016', BUILDING_NO: '02', FLOOR_NO: '22F', AREA_NO: 'PP', GROSS_SPACE: 112 },
    { LOCATION_No: 'QQ017', BUILDING_NO: '03', FLOOR_NO: '11F', AREA_NO: 'QQ', GROSS_SPACE: 72 },
    { LOCATION_No: 'RR018', BUILDING_NO: '01', FLOOR_NO: '22F', AREA_NO: 'RR', GROSS_SPACE: 145 },
    { LOCATION_No: 'SS019', BUILDING_NO: '04', FLOOR_NO: '10F', AREA_NO: 'SS', GROSS_SPACE: 101 },
    { LOCATION_No: 'TT020', BUILDING_NO: '02', FLOOR_NO: '23F', AREA_NO: 'TT', GROSS_SPACE: 118 },
  ];

  searchLocations(body: any): Observable<LocationData[]> {
    return of(
      this.mockLocations.filter((location) => {
        const locationNoMatch = !body.LOCATION_No || location.LOCATION_No.toLowerCase().includes(body.LOCATION_No.toLowerCase());
        const buildingNoMatch = !body.BUILDING_NO || body.BUILDING_NO.length === 0 || body.BUILDING_NO.includes(location.BUILDING_NO);
        const floorNoMatch = !body.FLOOR_NO || body.FLOOR_NO.length === 0 || body.FLOOR_NO.includes(location.FLOOR_NO);
        const areaNoMatch = !body.AREA_NO || body.AREA_NO.length === 0 || body.AREA_NO.includes(location.AREA_NO);
        return locationNoMatch && buildingNoMatch && floorNoMatch && areaNoMatch;
      })
    ).pipe(delay(500)); // 模擬 500 毫秒的 API 延遲
  }
}
