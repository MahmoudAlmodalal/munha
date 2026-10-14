export const SERVICES = {parts:'قطع غيار الشاحنات',equipment:'المعدات الثقيلة والرافعات',import:'الاستيراد والتوريد من الصين',maintenance:'خدمات الصيانة'};

export function makeWhatsAppUrl({name = '', service, details}) {
  if (!Object.hasOwn(SERVICES, service)) throw new Error('يرجى اختيار نوع الطلب.');
  if (typeof details !== 'string' || !details.trim()) throw new Error('يرجى كتابة تفاصيل طلبك.');
  if (typeof name !== 'string' || name.length > 80 || details.length > 1500) throw new Error('يرجى اختصار تفاصيل الطلب.');
  const recipient = service === 'import' ? '966596945222' : '966594344888';
  const message = ['السلام عليكم، أرغب في طلب عرض سعر من شركة الفارع الدولية.',name.trim() && `الاسم / المنشأة: ${name.trim()}`,`نوع الطلب: ${SERVICES[service]}`,`تفاصيل الطلب: ${details.trim()}`].filter(Boolean).join('\n');
  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}
