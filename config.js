/* =====================================================
   إعدادات مطعم دار الذوق
   عدّل هذه المعلومات لتناسب المطعم الحقيقي.
   رقم واتساب بصيغة دولية: رمز الدولة ثم الرقم دون + أو مسافات.
   مثال العراق: 9647XXXXXXXXX
   ===================================================== */

const CONFIG = {
    name: 'دار الذوق',
    whatsapp: '96407779676102', // استبدله برقم واتساب المطعم الحقيقي
    phone: '07XXXXXXXXX',
    address: 'الموصل، العراق',
    hours: 'يوميًا من 11 صباحًا إلى 12 ليلًا',
    heroTitle: 'وجبتك المفضلة،<br><span>على أصولها.</span>',
    heroText: 'مكونات مختارة، تحضير بعناية، وطعم يخليك ترجع مرة ثانية.',
    about: 'نقدم أطباقًا محضرة بعناية، مع اهتمام بالتفاصيل والنكهة وتجربة طلب سهلة من البداية للنهاية.',
    featuredId: 1,
    social: {
        facebook: '',
        instagram: '',
        tiktok: ''
    }
};

/*
 * قائمة الطعام
 * --------------------------------------------------
 * كل صنف يحتاج إلى:
 * id    : رقم فريد لا يتكرر بين الأصناف.
 * name  : اسم الوجبة.
 * cat   : التصنيف الذي سيظهر كزر فلترة.
 * price : السعر بالدينار العراقي، كرقم من دون فواصل.
 * emoji : رمز بديل عند تعذّر تحميل الصورة.
 * image : رابط الصورة.
 * desc  : وصف قصير يظهر على بطاقة الوجبة.
 *
 * الصور الحالية توضيحية من Unsplash؛ الأفضل استبدالها بصور المطعم.
 */
const MENU = [
    // ——— البرغر ———
    {
        id: 1,
        name: 'برغر لحم',
        cat: 'برغر',
        price: 8000,
        emoji: '🍔',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85',
        desc: 'لحم مشوي، جبن، خضار وصوص خاص.'
    },
    {
        id: 2,
        name: 'برغر دجاج',
        cat: 'برغر',
        price: 7500,
        emoji: '🍔',
        image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=85',
        desc: 'دجاج مقرمش مع الخضار وصوص مميز.'
    },
    // ——— البيتزا ———
    {
        id: 3,
        name: 'بيتزا مكس',
        cat: 'بيتزا',
        price: 12000,
        emoji: '🍕',
        image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85',
        desc: 'بيتزا غنية بالإضافات والنكهات.'
    },
    {
        id: 4,
        name: 'بيتزا جبن',
        cat: 'بيتزا',
        price: 10000,
        emoji: '🍕',
        image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85',
        desc: 'جبن ذائب مع صلصة طماطم متبلة.'
    },
    // ——— الوجبات ———
    {
        id: 5,
        name: 'وجبة دجاج',
        cat: 'وجبات',
        price: 11000,
        emoji: '🍗',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85',
        desc: 'وجبة دجاج تقدم مع إضافات جانبية.'
    },
    // ——— المقبلات ———
    {
        id: 6,
        name: 'بطاطا بالجبن',
        cat: 'مقبلات',
        price: 5000,
        emoji: '🍟',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=85',
        desc: 'بطاطا ذهبية مع صوص الجبن.'
    },
    {
        id: 7,
        name: 'أجنحة دجاج',
        cat: 'مقبلات',
        price: 8500,
        emoji: '🍗',
        image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=900&q=85',
        desc: 'أجنحة متبلة بنكهة غنية.'
    },
    {
        id: 8,
        name: 'سلطة طازجة',
        cat: 'مقبلات',
        price: 4000,
        emoji: '🥗',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
        desc: 'خضار طازجة وتتبيلة خفيفة.'
    }
];
