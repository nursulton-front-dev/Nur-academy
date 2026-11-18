export interface UpcomingCourse {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  badge: string;
  notice: string;
}

/** Announcements only: these courses are not open for enrollment. */
export const upcomingCourses: UpcomingCourse[] = [
  {
    id: 'geografiya',
    title: 'Geografiya attestatsiyasi',
    description: 'Geografiya o‘qituvchilari uchun ham kurs qo‘shishni rejalashtiryapmiz. Kurs ochilganda, dastur va darslar haqida shu yerda ma’lumot beramiz.',
    cover_url: '/images/landing/course-geografiya.webp',
    badge: 'Tayyorlanmoqda',
    notice: 'Kursga yozilish hali ochilmagan',
  },
  {
    id: 'ona-tili',
    title: 'Ona tili attestatsiyasi',
    description: 'Ona tili o‘qituvchilari uchun attestatsiyaga tayyorgarlik kursini rejalashtiryapmiz. Kurs ochilganda, dastur bilan shu yerda tanishishingiz mumkin.',
    cover_url: '/images/landing/course-ona-tili.webp',
    badge: 'Tayyorlanmoqda',
    notice: 'Kursga yozilish hali ochilmagan',
  },
];
