export function validateBookingTime(startTime: string, endTime: string, attendees: number): string | null {
  if (startTime !== '' && endTime !== '') {
    if (endTime <= startTime) {
      return '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (attendees < 1) {
      return '참석 인원은 1명 이상이어야 합니다.';
    }
  }
  return null;
}
