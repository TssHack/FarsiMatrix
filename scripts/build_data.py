import os
import json
import re

DICT_DIR = '/home/ehsan/.hermes/cache/scratch/dictionaries/Dictionaries'
OUTPUT_DIR = '/home/ehsan/farsimatrix/public/data'
GROUPS_DIR = os.path.join(OUTPUT_DIR, 'groups')

os.makedirs(GROUPS_DIR, exist_ok=True)

# Curated metadata for 69 groups
METADATA = {
    'computer': {'fa': 'کامپیوتر و انفورماتیک', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'Laptop', 'level': 'متوسط', 'desc': 'واژگان تخصصی علوم کامپیوتر، سخت‌افزار، نرم‌افزار و شبکه'},
    'algorithms': {'fa': 'الگوریتم‌ها و ساختمان داده', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'Cpu', 'level': 'پیشرفته', 'desc': 'اصطلاحات تخصصی نظریه الگوریتم‌ها و ساختارهای داده'},
    'it': {'fa': 'فناوری اطلاعات (IT)', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'Server', 'level': 'متوسط', 'desc': 'اصطلاحات شبکه، سیستم‌های ابری و مدیریت فناوری'},
    'internet': {'fa': 'اینترنت و ارتباطات وب', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'Globe', 'level': 'مقدماتی', 'desc': 'واژگان دنیای وب، پروتکل‌ها، مرورگرها و خدمات آنلاین'},
    'domains': {'fa': 'دامنه‌ها و وبسایت', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'AtSign', 'level': 'مقدماتی', 'desc': 'پسوندها و اصطلاحات نام‌های دامنه اینترنتی'},
    'graphics': {'fa': 'گرافیک و طراحی رایانه‌ای', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'Palette', 'level': 'متوسط', 'desc': 'مفاهیم پردازش تصویر، رنگ‌بندی و طراحی دیجیتال'},
    'vb': {'fa': 'برنامه‌نویسی و ویژوال بیسیک', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'Code', 'level': 'متوسط', 'desc': 'کلیدواژه‌ها و دستورات برنامه‌نویسی'},
    'modem-errors': {'fa': 'خطاهای مودم و شبکه', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'WifiOff', 'level': 'پیشرفته', 'desc': 'کدهای خطا و عیب‌یابی اتصالات مخابراتی'},
    'electronics-1': {'fa': 'الکترونیک ۱ (پایه‌ای)', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'Zap', 'level': 'مقدماتی', 'desc': 'مفاهیم اساسی مدارها، قطعات و الکترونیک'},
    'electronics-2': {'fa': 'الکترونیک ۲ (پیشرفته)', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'Zap', 'level': 'پیشرفته', 'desc': 'واژه‌نامه جامع مهندسی الکترونیک و ابزار دقیق'},
    'electronics-3': {'fa': 'الکترونیک ۳ (تخصصی)', 'cluster': 'tech', 'clusterFa': 'فناوری و مهندسی', 'icon': 'Zap', 'level': 'پیشرفته', 'desc': 'سیستم‌های دیجیتال و پردازش سیگنال الکترونیک'},

    'essential-english-words': {'fa': 'کلمات ضروری انگلیسی ۱', 'cluster': 'language', 'clusterFa': 'آموزش زبان و مکالمه', 'icon': 'BookOpen', 'level': 'مقدماتی', 'desc': 'لغات طلایی و پرکاربرد روزمره برای تقویت دایره واژگان'},
    'essential-english-words-2': {'fa': 'کلمات ضروری انگلیسی ۲', 'cluster': 'language', 'clusterFa': 'آموزش زبان و مکالمه', 'icon': 'Sparkles', 'level': 'متوسط', 'desc': 'مجموعه گسترده لغات مهم آزمون‌های تافل، آیلتس و کنکور'},
    'learn-english': {'fa': 'آموزش و یادگیری انگلیسی', 'cluster': 'language', 'clusterFa': 'آموزش زبان و مکالمه', 'icon': 'GraduationCap', 'level': 'مقدماتی', 'desc': 'واژگان کاربردی ساختارمند برای زبان‌آموزان'},
    'idioms-1': {'fa': 'اصطلاحات و ضرب‌المثل‌ها ۱', 'cluster': 'language', 'clusterFa': 'آموزش زبان و مکالمه', 'icon': 'MessageCircle', 'level': 'متوسط', 'desc': 'اصطلاحات رایج انگلیسی با معادل‌های شیرین فارسی'},
    'idioms-2': {'fa': 'اصطلاحات و کنایه‌ها ۲', 'cluster': 'language', 'clusterFa': 'آموزش زبان و مکالمه', 'icon': 'Smile', 'level': 'متوسط', 'desc': 'عبارات عامیانه و تعابیر پرکاربرد محاوره‌ای'},
    'idioms-3': {'fa': 'اصطلاحات مفهومی ۳', 'cluster': 'language', 'clusterFa': 'آموزش زبان و مکالمه', 'icon': 'Lightbulb', 'level': 'پیشرفته', 'desc': 'ضرب‌المثل‌های غنی و ریشه‌دار زبان انگلیسی'},
    'illustrated-idioms': {'fa': 'اصطلاحات تصویری و تمثیلی', 'cluster': 'language', 'clusterFa': 'آموزش زبان و مکالمه', 'icon': 'Image', 'level': 'متوسط', 'desc': 'اصطلاحات مصور با بار معنایی توصیفی بالا'},
    'chat-slang': {'fa': 'اصطلاحات چت و اینترنت', 'cluster': 'language', 'clusterFa': 'آموزش زبان و مکالمه', 'icon': 'MessageSquare', 'level': 'مقدماتی', 'desc': 'مخفف‌ها، اسلنگ‌ها و زبان محاوره در شبکه‌های اجتماعی'},
    'common-first-names': {'fa': 'نام‌های رایج انگلیسی', 'cluster': 'language', 'clusterFa': 'آموزش زبان و مکالمه', 'icon': 'Users', 'level': 'مقدماتی', 'desc': 'اسامی پرتکرار بین‌المللی همراه با تلفظ و معادل فارسی'},

    'accounting-1': {'fa': 'حسابداری و مالی ۱', 'cluster': 'business', 'clusterFa': 'کسب‌وکار و مدیریت', 'icon': 'Calculator', 'level': 'متوسط', 'desc': 'اصطلاحات حسابداری مالی، ترازنامه و دفاتر حساب'},
    'accounting-2': {'fa': 'حسابداری و مالی ۲', 'cluster': 'business', 'clusterFa': 'کسب‌وکار و مدیریت', 'icon': 'TrendingUp', 'level': 'پیشرفته', 'desc': 'مفاهیم حسابرسی، مالیات و استانداردهای گزارشگری'},
    'accounting-3': {'fa': 'حسابداری ۳ (بانک و بیمه)', 'cluster': 'business', 'clusterFa': 'کسب‌وکار و مدیریت', 'icon': 'Coins', 'level': 'پیشرفته', 'desc': 'واژگان سرمایه‌گذاری، بورس و مدیریت بودجه'},
    'management-1': {'fa': 'مدیریت و رهبری ۱', 'cluster': 'business', 'clusterFa': 'کسب‌وکار و مدیریت', 'icon': 'Briefcase', 'level': 'متوسط', 'desc': 'اصطلاحات مدیریت سازمان، منابع انسانی و برنامه‌ریزی'},
    'management-2': {'fa': 'مدیریت بازرگانی ۲', 'cluster': 'business', 'clusterFa': 'کسب‌وکار و مدیریت', 'icon': 'Target', 'level': 'پیشرفته', 'desc': 'استراتژی کسب‌وکار، بازاریابی و زنجیره ارزش'},
    'law': {'fa': 'حقوق و علوم قضایی', 'cluster': 'business', 'clusterFa': 'کسب‌وکار و مدیریت', 'icon': 'Scale', 'level': 'پیشرفته', 'desc': 'واژگان حقوق تجارت، قراردادها و قوانین بین‌المللی'},

    'math': {'fa': 'ریاضیات و هندسه', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'Compass', 'level': 'متوسط', 'desc': 'مفاهیم حسابان، آمار، جبر و هندسه تحلیلی'},
    'statistics-1': {'fa': 'آمار و احتمالات ۱', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'BarChart3', 'level': 'متوسط', 'desc': 'شاخص‌های آماری، توزیع‌های احتمال و داده‌ورزی'},
    'statistics-2': {'fa': 'آمار کاربردی ۲', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'PieChart', 'level': 'پیشرفته', 'desc': 'رگرسیون، آزمون فرض و تحلیل سری‌های زمانی'},
    'biology': {'fa': 'زیست‌شناسی و علوم زیستی', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'Dna', 'level': 'متوسط', 'desc': 'واژگان ژنتیک، بوم‌شناسی، سلولی و فیزیولوژی'},
    'astronomy': {'fa': 'نجوم و اخترشناسی', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'Moon', 'level': 'متوسط', 'desc': 'کیهان‌شناسی، سیارات، ستارگان و اجرام آسمانی'},
    'science-1': {'fa': 'علوم پایه ۱', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'Atom', 'level': 'متوسط', 'desc': 'مفاهیم عام فیزیک و علوم طبیعی'},
    'science-2': {'fa': 'علوم پایه ۲ (شیمی)', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'FlaskConical', 'level': 'متوسط', 'desc': 'عناصر، ترکیبات و آزمایشگاه'},
    'medicinal-plants': {'fa': 'گیاهان دارویی و طب سنتی', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'Leaf', 'level': 'مقدماتی', 'desc': 'نام‌های علمی و خواص گیاهان شفابخش'},
    'phobia': {'fa': 'فوبیاها و روانشناسی ترس', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'AlertCircle', 'level': 'متوسط', 'desc': 'انواع فوبیا و ترس‌های خاص در روانشناسی'},
    'dentistry': {'fa': 'دندانپزشکی و بهداشت دهان', 'cluster': 'science', 'clusterFa': 'علوم پایه و دانشگاهی', 'icon': 'Activity', 'level': 'متوسط', 'desc': 'اصطلاحات دهان، دندان، ایمپلنت و ترمیم'},

    'chemical-engineering': {'fa': 'مهندسی شیمی', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Flame', 'level': 'پیشرفته', 'desc': 'عملیات واحد، ترمودینامیک و صنایع پتروشیمی'},
    'industrial-engineering-1': {'fa': 'مهندسی صنایع ۱', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Factory', 'level': 'متوسط', 'desc': 'کنترل پروژه، بهبود بهره‌وری و کنترل کیفیت'},
    'industrial-engineering-2': {'fa': 'مهندسی صنایع ۲', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Settings', 'level': 'پیشرفته', 'desc': 'تحقیق در عملیات و شبیه‌سازی سیستم‌ها'},
    'aviation': {'fa': 'هوانوردی و صنایع هوایی', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Plane', 'level': 'پیشرفته', 'desc': 'اصطلاحات پرواز، ناوبری هوایی و مکانیک هواپیما'},
    'petroleum-1': {'fa': 'مهندسی نفت ۱ (حفاری)', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Droplets', 'level': 'پیشرفته', 'desc': 'اکتشاف، زمین‌شناسی و دکل‌های نفتی'},
    'petroleum-2': {'fa': 'مهندسی نفت ۲ (پالایش)', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Droplet', 'level': 'پیشرفته', 'desc': 'پالایش، خطوط لوله و مخازن هیدروکربوری'},
    'polymer': {'fa': 'مهندسی پلیمر و پلاستیک', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Layers', 'level': 'پیشرفته', 'desc': 'ماکرومولکول‌ها، مواد پلیمری و سنتز مواد'},
    'textile': {'fa': 'مهندسی نساجی و الیاف', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Scissors', 'level': 'متوسط', 'desc': 'رنگرزی، نخ‌ریسی و بافت منسوجات'},
    'soil': {'fa': 'مکانیک خاک و ژئوتکنیک', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Layers', 'level': 'متوسط', 'desc': 'شناخت بستر زمین، آزمایش خاک و پی‌سازی'},
    'geology': {'fa': 'زمین‌شناسی و کانی‌ها', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Mountain', 'level': 'متوسط', 'desc': 'سنگ‌شناسی، فسیل‌ها و ساختارهای زمین'},
    'geologist': {'fa': 'زمین‌شناسی تخصصی', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Compass', 'level': 'پیشرفته', 'desc': 'اکتشاف معدن و تکتونیک زمین'},
    'hydogeology': {'fa': 'هیدروژئولوژی (آب‌های زیرزمینی)', 'cluster': 'engineering', 'clusterFa': 'فنی و مهندسی', 'icon': 'Waves', 'level': 'پیشرفته', 'desc': 'سفره‌های آب و منابع زیرسطحی'},

    'cinema-1': {'fa': 'سینما و فیلم ۱', 'cluster': 'arts', 'clusterFa': 'هنر و رسانه', 'icon': 'Film', 'level': 'مقدماتی', 'desc': 'اصطلاحات پایه کارگردانی، فیلمنامه و بازیگری'},
    'cinema-2': {'fa': 'سینما و فیلم ۲ (فنی)', 'cluster': 'arts', 'clusterFa': 'هنر و رسانه', 'icon': 'Video', 'level': 'متوسط', 'desc': 'نورپردازی، تدوین، صداگذاری و جلوه‌های ویژه'},
    'cinema-3': {'fa': 'سینما ۳ (تولید و نقد)', 'cluster': 'arts', 'clusterFa': 'هنر و رسانه', 'icon': 'Tv', 'level': 'پیشرفته', 'desc': 'نقد فیلم، ژانرشناسی و پخش سینمایی'},
    'subtitles': {'fa': 'زیرنویس فیلم‌ها و سریال‌ها', 'cluster': 'arts', 'clusterFa': 'هنر و رسانه', 'icon': 'Subtitles', 'level': 'متوسط', 'desc': 'لغات و اصطلاحات روزمره گفتاری در فیلم‌های سینمایی'},
    'wikipedia-fa-en': {'fa': 'اصطلاحات دانشنامه‌ای ویکی‌پدیا', 'cluster': 'general', 'clusterFa': 'عمومی و فرهنگ‌ها', 'icon': 'BookMarked', 'level': 'پیشرفته', 'desc': 'مدخل‌های علمی و تاریخی دو زبانه'}
}

for i in range(1, 17):
    k = f'generic-{i}'
    METADATA[k] = {
        'fa': f'دیکشنری عمومی (بخش {i})',
        'cluster': 'general',
        'clusterFa': 'عمومی و فرهنگ‌ها',
        'icon': 'Book',
        'level': 'متوسط',
        'desc': f'واژگان کاربردی انگلیسی به فارسی بر اساس فرهنگ لغت معتبر (بخش {i})'
    }

def clean_text(t):
    if not t: return ''
    # remove excessive spaces
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def build_data():
    categories = []
    groups = sorted([g for g in os.listdir(DICT_DIR) if os.path.isdir(os.path.join(DICT_DIR, g))])
    
    print(f"Processing {len(groups)} dictionary groups...")
    
    for g in groups:
        meta = METADATA.get(g, {
            'fa': g,
            'cluster': 'general',
            'clusterFa': 'عمومی',
            'icon': 'Book',
            'level': 'متوسط',
            'desc': f'واژگان مربوط به {g}'
        })
        
        g_path = os.path.join(DICT_DIR, g)
        raw_words = []
        
        # Read all letter JSON files in this group
        for f in sorted(os.listdir(g_path)):
            if f.endswith('.json'):
                try:
                    with open(os.path.join(g_path, f), 'r', encoding='utf-8-sig') as fp:
                        data = json.load(fp)
                        words = data.get('Words', [])
                        raw_words.extend(words)
                except Exception as e:
                    pass
        
        # Deduplicate & sanitize
        seen = set()
        cleaned_words = []
        for idx, item in enumerate(raw_words):
            word_str = clean_text(item.get('EnglishWord', ''))
            if not word_str or word_str.lower() in seen:
                continue
            seen.add(word_str.lower())
            
            raw_meanings = item.get('Meanings', [])
            meanings = []
            for m in raw_meanings:
                cleaned_m = clean_text(m)
                if cleaned_m and cleaned_m not in meanings:
                    meanings.append(cleaned_m)
            
            if not meanings:
                continue
                
            cleaned_words.append({
                'id': f"{g}_{len(cleaned_words) + 1}",
                'word': word_str,
                'meanings': meanings,
                'category': g
            })
            
        word_count = len(cleaned_words)
        if word_count == 0:
            continue
            
        cat_info = {
            'id': g,
            'title': meta['fa'],
            'englishTitle': g.replace('-', ' ').title(),
            'description': meta['desc'],
            'cluster': meta['cluster'],
            'clusterTitle': meta['clusterFa'],
            'icon': meta['icon'],
            'level': meta['level'],
            'wordCount': word_count
        }
        categories.append(cat_info)
        
        # Save group words JSON
        out_group_file = os.path.join(GROUPS_DIR, f"{g}.json")
        with open(out_group_file, 'w', encoding='utf-8') as out_fp:
            json.dump(cleaned_words, out_fp, ensure_ascii=False, separators=(',', ':'))
            
        print(f"Saved {g:26}: {word_count:6} words -> {out_group_file}")

    # Sort categories: put focused learning categories first (language, tech, business, science, engineering, arts, general)
    cluster_order = {'language': 1, 'tech': 2, 'business': 3, 'science': 4, 'engineering': 5, 'arts': 6, 'general': 7}
    categories.sort(key=lambda x: (cluster_order.get(x['cluster'], 99), -x['wordCount'] if x['cluster'] == 'language' else x['wordCount']))

    cat_file = os.path.join(OUTPUT_DIR, 'categories.json')
    with open(cat_file, 'w', encoding='utf-8') as cat_fp:
        json.dump(categories, cat_fp, ensure_ascii=False, indent=2)
        
    print(f"\nDone! Exported {len(categories)} categories to {cat_file}")

if __name__ == '__main__':
    build_data()
