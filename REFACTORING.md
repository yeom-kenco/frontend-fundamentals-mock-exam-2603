# 회의실 예약 시스템 리팩토링 문서

## 개요

토스 Frontend Fundamentals 면접 과제인 회의실 예약 시스템을 리팩토링했습니다.
모놀리식 페이지 컴포넌트(305줄 + 402줄)를 **예측 가능하고**, **관심사가 분리된** 구조로 개선했습니다.

---

## 리팩토링 원칙

| 원칙                                | 적용 내용                                                                |
| ----------------------------------- | ------------------------------------------------------------------------ |
| 코드는 예측하며 읽는다              | 함수명/훅명만으로 역할을 파악할 수 있도록 구조화                         |
| 이름은 역할을 숨기지 않아야         | `handleCancel` → `cancelReservationById`, `confirmAndCancelReservation`  |
| 데이터는 사용처 근처에              | 중복 상수를 공유 모듈로, `getRoomName`을 사용하는 컴포넌트 내부로        |
| 상태 출처는 하나                    | useState + useEffect 이중 동기화 → URL을 단일 출처로                     |
| 컴포넌트는 자기 박스만 책임         | 타임라인/예약목록/회의실목록을 독립 컴포넌트로                           |
| 추상화는 예측을 돕기 위한 것        | 필터 폼은 인라인 유지, 반복 패턴(FilterField)만 추출                     |
| 페이지는 안내 표지판                | ReservationStatusPage 72줄 — 위에서 아래로 흐름 파악                     |
| Hook은 관심사별 분리                | 7개 커스텀 훅, 각각 단일 책임                                            |
| URL searchParams가 상태 출처        | `useBookingSearchParams` — URL에서 직접 읽고 쓰기                        |
| navigate state는 숨겨진 데이터 경로 | `navigate('/', { state })` → `navigate('/?status=booked')`               |
| props는 호출처 맥락 노출 금지       | `DateSelector`의 props: `value/onChange` (호출처의 `setDate` 노출 안 함) |

---

## 변경 전후 비교

### 파일 구조

**Before:**

```
src/pages/
  ReservationStatusPage/index.tsx   (305줄 — 모든 로직 포함)
  RoomBookingPage/index.tsx         (402줄 — 모든 로직 포함)
  remotes.ts
  http.ts
```

**After:**

```
src/
  constants/
    equipment.ts                    # EQUIPMENT_LABELS, ALL_EQUIPMENT
    timeSlots.ts                    # TIME_SLOTS, HOUR_LABELS, 타임라인 상수
  types/
    reservation.ts                  # Room, Reservation 등 공유 타입
  utils/
    date.ts                         # formatDate
    timeline.ts                     # timeToMinutes
  pages/
    ReservationStatusPage/
      index.tsx                     # 72줄 — 안내 표지판
      hooks/
        useReservationTimeline.ts   # 회의실 + 예약 현황 쿼리
        useMyReservations.ts        # 내 예약 조회 + 취소
        useStatusMessage.ts         # URL status 기반 메시지 관리
      components/
        DateSelector.tsx            # 날짜 입력
        ReservationTimeline.tsx     # 타임라인 시각화 + 툴팁
        MessageBanner.tsx           # 성공/에러 메시지 배너
        MyReservationList.tsx       # 내 예약 목록 + 취소
    RoomBookingPage/
      index.tsx                     # 207줄 — 필터 인라인 + 훅 조합
      hooks/
        useBookingSearchParams.ts   # URL → 필터 상태 (SSOT)
        useBookingValidation.ts     # 시간/인원 유효성 검증
        useAvailableRooms.ts        # 방 쿼리 + 필터링 + 정렬
        useBookingSubmit.ts         # 예약 생성 + 에러 핸들링
      components/
        FilterField.tsx             # 라벨 + 필드 레이아웃 패턴
        EquipmentToggleGroup.tsx    # 장비 토글 버튼 그룹
        AvailableRoomList.tsx       # 가용 회의실 목록 + 확정 버튼
```

### 줄 수 변화

| 파일                            | Before | After     |
| ------------------------------- | ------ | --------- |
| ReservationStatusPage/index.tsx | 305줄  | **72줄**  |
| RoomBookingPage/index.tsx       | 402줄  | **207줄** |

---

## 상세 변경 내역

### 1. 공유 상수 및 유틸리티 추출

양쪽 페이지에 **동일하게 중복 정의**되어 있던 코드를 공유 모듈로 추출했습니다.

- `EQUIPMENT_LABELS`, `ALL_EQUIPMENT` → `src/constants/equipment.ts`
- `TIME_SLOTS`, `HOUR_LABELS`, `TIMELINE_START` 등 → `src/constants/timeSlots.ts`
- `formatDate` → `src/utils/date.ts`
- `timeToMinutes` → `src/utils/timeline.ts`

### 2. 공유 타입 정의 추출

인라인으로 반복되던 타입 어노테이션을 명시적 인터페이스로 추출했습니다.

```tsx
// Before: 6곳에서 반복
(r: { id: string; roomId: string; date: string; start: string; end: string; attendees: number; equipment: string[] })

// After: 한번 정의, import해서 사용
import type { Reservation } from 'types/reservation';
```

### 3. navigate state 안티패턴 제거

예약 완료 메시지를 `location.state`라는 숨겨진 경로로 전달하던 방식을 URL 파라미터로 변경했습니다.

```tsx
// Before — 숨겨진 데이터 경로
navigate('/', { state: { message: '예약이 완료되었습니다!' } });
// 받는 쪽: location.state 읽기 + window.history.replaceState({}, '') 정리 필요

// After — 의미 기반 URL 파라미터
navigate('/?status=booked');
// 받는 쪽: STATUS_MESSAGES 매핑으로 메시지 표시
```

메시지 문자열이 아닌 **상태 코드**를 전달하여, 받는 쪽에서 `status` 값만 보고 어떤 메시지를 보여줄지 예측할 수 있습니다.

### 4. URL을 Single Source of Truth로 (useBookingSearchParams)

필터 상태의 이중 동기화 패턴을 제거하고, URL을 유일한 상태 저장소로 변경했습니다.

```tsx
// Before — 이중 동기화 (useState + useEffect)
const [date, setDate] = useState(searchParams.get('date') || formatDate(new Date()));
const [startTime, setStartTime] = useState(searchParams.get('startTime') || '');
// ... 7개 useState
useEffect(() => {
  setSearchParams(params, { replace: true }); // state → URL 역동기화
}, [date, startTime, endTime, ...7개 의존성]);

// After — URL에서 직접 읽고 쓰기 (useState/useEffect 없음)
const { date, startTime, setDate, setStartTime, ... } = useBookingSearchParams();
```

### 5. 관심사별 커스텀 훅 분리

| 훅                       | 담당                                                 |
| ------------------------ | ---------------------------------------------------- |
| `useReservationTimeline` | 회의실 목록 + 날짜별 예약 현황 쿼리                  |
| `useMyReservations`      | 내 예약 조회 + 취소 mutation + 쿼리 무효화           |
| `useStatusMessage`       | URL status 파라미터 → 메시지 초기화 + 성공/에러 표시 |
| `useBookingSearchParams` | URL ↔ 필터 상태 (단일 출처)                          |
| `useBookingValidation`   | 시간/인원 유효성 검증 (순수 파생 값)                 |
| `useAvailableRooms`      | 방 쿼리 + 용량/장비/층/시간충돌 필터링 + 정렬        |
| `useBookingSubmit`       | 예약 생성 mutation + axios 에러 핸들링 + 네비게이션  |

### 6. 컴포넌트 분리 전략

**분리한 것** — 자체적인 관심사가 명확한 UI 영역:

| 컴포넌트              | 이유                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| `DateSelector`        | 날짜 입력 UI (양쪽 페이지에서 재사용 가능, `value/onChange` 범용 인터페이스) |
| `ReservationTimeline` | 자체 UI 상태(`activeReservationId`)를 가진 독립적 시각화 영역                |
| `MessageBanner`       | 호출처 맥락을 모르는 범용 메시지 표시                                        |
| `MyReservationList`   | 목록 렌더링 + 취소 확인 + `getRoomName` 헬퍼를 데이터 사용처 근처에 배치     |
| `AvailableRoomList`   | 결과 표시 영역 (선택 상태, 빈 상태, 카드 렌더링, 확정 버튼)                  |

**인라인 유지한 것** — 필터 입력 폼:

필터 폼은 RoomBookingPage의 **핵심 관심사**입니다. 통째로 `BookingFilters` 컴포넌트로 숨기면 "어떤 필터가 있는지" 알기 위해 별도 파일을 열어야 하고, 이는 예측 가능성을 낮춥니다. 대신 반복되는 **패턴만 추출**했습니다:

- `FilterField` — 라벨 + 필드 레이아웃 (6회 반복되던 패턴)
- `EquipmentToggleGroup` — 자체 배열 조작 로직이 있는 토글 버튼 그룹
- `inputStyle` — 날짜/숫자 input에 동일하게 적용되던 CSS 상수

### 7. 구체적 함수명 사용

```tsx
// Before — 모호한 이름
handleCancel(res.id);
setMessage({ type: 'success', text: '...' });

// After — 역할이 드러나는 이름
cancelReservationById(id); // 훅: ID로 예약을 취소하는 API 호출
confirmAndCancelReservation(id); // 페이지: 확인 다이얼로그 후 취소 + 결과 메시지
showSuccess('...'); // 성공 메시지 표시
submitBooking(data); // 예약 생성 요청
```

---

## 페이지 최종 구조

### ReservationStatusPage (72줄)

```
회의실 예약 (제목)
  ↓
DateSelector — 날짜 선택
  ↓
ReservationTimeline — 타임라인 시각화
  ↓
MessageBanner — 예약 완료/취소 결과 메시지
  ↓
MyReservationList — 내 예약 목록 + 취소
  ↓
예약하기 버튼 → /booking 이동
```

### RoomBookingPage (207줄)

```
← 뒤로가기 버튼
예약하기 (제목)
에러 메시지 배너
  ↓
예약 조건 (필터 — 인라인)
  ├── FilterField: 날짜
  ├── FilterField: 시작 시간 / 종료 시간
  ├── FilterField: 참석 인원 / 선호 층
  └── EquipmentToggleGroup: 장비 선택
  ↓
유효성 검증 에러
  ↓
AvailableRoomList — 가용 회의실 목록 + 확정 버튼
```

---

## 테스트

모든 리팩토링 단계에서 **20개 테스트 전체 통과**를 확인하며 진행했습니다.

- Easy 스펙: 14개 (기본 기능)
- Hard 스펙: 6개 (심화 기능)

```bash
yarn test
# Test Files  2 passed (2)
#      Tests  20 passed (20)
```

---

## 커밋 히스토리

```
ca47058 refactor: abstract filter UI patterns (FilterField, EquipmentToggleGroup)
d7717ca refactor: extract AvailableRoomList component
cfd28fa refactor: extract MyReservationList component
5f14371 refactor: extract MessageBanner component
798ee6e refactor: extract ReservationTimeline component
1cd8a05 refactor: extract DateSelector component
f8953a0 refactor: extract useBookingSubmit hook
dc7468e refactor: extract useAvailableRooms hook
e7ac991 refactor: extract useBookingValidation hook
5b01464 refactor: extract useStatusMessage hook
721f742 refactor: extract useMyReservations hook
e0e9ee9 refactor: extract useReservationTimeline hook
73c6144 refactor: extract useBookingSearchParams hook (URL as SSOT)
83f892a refactor: replace navigate state with URL status param
d08ece9 refactor: extract shared type definitions
adfec95 refactor: extract shared utilities (formatDate, timeToMinutes)
5be4191 refactor: extract shared constants (equipment, timeSlots)
```
