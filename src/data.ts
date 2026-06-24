import { Product } from './types';
import heroBanner from './assets/images/echove_hero_banner_1782291726044.jpg';
import denimJacket from './assets/images/echove_denim_jacket_1782291760962.jpg';
import denimPants from './assets/images/echove_denim_pants_1782291777066.jpg';
import denimBag from './assets/images/echove_denim_bag_1782291744582.jpg';
import denimHat from './assets/images/echove_denim_hat_1782291794645.jpg';

export const HERO_BANNER = heroBanner;

export const PRODUCTS: Product[] = [
  {
    id: 'echove-01',
    name: 'Áo Khoác Denim "Deconstructed" Patchwork',
    price: 1250000,
    description: 'Chiếc áo khoác khoác ngoài dáng lửng, deconstructed hoàn toàn từ 4 chiếc quần jean cũ khác tông màu. Các vết sờn rách, chỉ khâu thô chạy dọc thân áo tạo điểm nhấn nổi loạn và nghệ thuật bụi bặm.',
    images: [
      denimJacket,
      'https://picsum.photos/seed/jacketdetail1/600/600',
      'https://picsum.photos/seed/jacketdetail2/600/600'
    ],
    category: 'outerwear',
    story: 'Được tụi mình thu nhặt từ những chiếc quần Levis cũ rách gối đã qua sử dụng lâu năm. Trải qua 3 công đoạn gột rửa kỹ càng, rã rập thủ công và hơn 12 tiếng ghép nối tỉ mỉ tại xưởng ECHOVE Hà Nội. Chiếc áo mang trong mình câu chuyện hành trình của 4 chiếc quần khác nhau, nay hồi sinh thành một tác phẩm nghệ thuật đường phố độc nhất vô nhị.',
    originalJeansCount: 4,
    artisanDifficulty: 'Cực khó',
    measurements: {
      chest: '120 cm (Oversized fit)',
      length: '68 cm',
      waist: 'N/A'
    },
    sizes: ['M', 'L'],
    isOneOfOne: true,
    isBestSeller: true
  },
  {
    id: 'echove-02',
    name: 'Quần Cargo Denim "Asymmetrical" Patchwork',
    price: 950000,
    description: 'Quần dáng suông rộng rãi phối túi hộp bất cân xứng độc đáo. Phần đầu gối được gia cố bằng nhiều lớp denim xếp đè lên nhau tăng độ cứng cáp, mang đậm phong cách Urban Streetwear.',
    images: [
      denimPants,
      'https://picsum.photos/seed/pantsdetail1/600/600'
    ],
    category: 'bottoms',
    story: 'Sự tái sinh của 3 chiếc quần jean thô rách đầu gối. Tụi mình đã cắt rã phần ống quần, tận dụng các đường viền túi cũ để tái tạo thành hệ thống túi hộp bất cân xứng đầy bụi bặm. Tông màu xanh chàm Indigo từ đậm đến nhạt phối xám tro tạo chiều sâu ấn tượng khi chuyển động.',
    originalJeansCount: 3,
    artisanDifficulty: 'Khó',
    measurements: {
      waist: '76 - 86 cm (Có thắt lưng dán)',
      length: '105 cm',
      thigh: '68 cm'
    },
    sizes: ['L', 'XL'],
    isOneOfOne: true,
    isBestSeller: true
  },
  {
    id: 'echove-03',
    name: 'Túi Đeo Chéo "Patchwork" Sling Bag',
    price: 420000,
    description: 'Túi bao tử đa năng, đeo chéo ngực cực chất. Khóa kéo thép hầm hố kết hợp dây đeo tùy chỉnh bản dày tái chế từ cạp quần jeans cũ cực kỳ chắc chắn.',
    images: [
      denimBag,
      'https://picsum.photos/seed/bagdetail1/600/600'
    ],
    category: 'accessories',
    story: 'Sử dụng các phần denim chất lượng cao còn sót lại từ phần đùi và hông quần jeans cũ của các nhà hảo tâm. Đường chỉ cam nguyên bản của jean gốc phối cùng khuy đồng nguyên thủy tạo cảm giác hoài niệm, "lived-in" đầy cá tính. Túi rộng rãi dạo phố thoải mái.',
    originalJeansCount: 1.5,
    artisanDifficulty: 'Trung bình',
    measurements: {
      length: '32 cm',
      chest: '20 cm (Rộng)'
    },
    sizes: ['Freesize'],
    isOneOfOne: true,
    isBestSeller: true
  },
  {
    id: 'echove-04',
    name: 'Nón Bucket Denim "ScrapWork" Hat',
    price: 280000,
    description: 'Nón bucket ráp nối tỉ mỉ từ các mảnh vải thừa (scraps). Vành nón xơ tua rua tự nhiên, form dáng đứng form và cực kỳ cá tính.',
    images: [
      denimHat,
      'https://picsum.photos/seed/hatdetail1/600/600'
    ],
    category: 'accessories',
    story: 'Với triết lý không lãng phí dù chỉ một dải vải nhỏ, tụi mình gom toàn bộ mảnh denim vụn từ quá trình cắt may áo khoác patchwork để khâu nối thành chiếc nón bucket này. Mỗi ô vải là một gam màu khác biệt kể lại trọn vẹn vòng lặp của sự tái sinh và ý thức bảo vệ môi trường.',
    originalJeansCount: 1,
    artisanDifficulty: 'Trung bình',
    measurements: {
      headSize: '56 - 58 cm (Freesize)'
    },
    sizes: ['Freesize'],
    isOneOfOne: true,
    isBestSeller: false
  },
  {
    id: 'echove-05',
    name: 'Áo Gilet Denim "Artisanal" Utility Vest',
    price: 750000,
    description: 'Áo gilet phong cách tactical, trang bị 4 túi hộp trước ngực ráp từ cạp và túi sau quần bò cũ. Dây kéo khóa xám cá tính thích hợp layering.',
    images: [
      'https://picsum.photos/seed/denimvest/600/600',
      'https://picsum.photos/seed/vestdetail1/600/600'
    ],
    category: 'outerwear',
    story: 'Lấy cảm hứng từ trang phục bảo hộ lao động kết hợp với văn hóa đường phố Hà Nội. Chiếc vest này tái sinh từ 2 chiếc quần jean sẫm màu đã bạc nhạc. Phần túi hộp trước ngực được giữ nguyên các vết sờn bạc màu tự nhiên của chủ nhân cũ, mang vết hằn thời gian chân thực nhất.',
    originalJeansCount: 2,
    artisanDifficulty: 'Khó',
    measurements: {
      chest: '110 cm',
      length: '62 cm'
    },
    sizes: ['S', 'M', 'L'],
    isOneOfOne: false,
    isBestSeller: false
  },
  {
    id: 'echove-06',
    name: 'Quần Short Denim "Distressed" Raw Hem',
    price: 480000,
    description: 'Quần short đùi dáng rộng với gấu quần tơi xơ sành điệu. Được nhuộm nhẹ một lớp màu xám tro tạo sắc thái hoài cổ trầm mặc.',
    images: [
      'https://picsum.photos/seed/denimshorts/600/600',
      'https://picsum.photos/seed/shortsdetail1/600/600'
    ],
    category: 'bottoms',
    story: 'Chiếc short hoàn hảo cho mùa hè bụi bặm. Tụi mình giữ nguyên kết cấu thô mộc, gia cố viền túi bằng chỉ khâu chữ X thô rải rác chạy dọc viền đùi. Chiếc quần mang đậm tinh thần phóng khoáng, vô lo của tuổi trẻ Gen Z.',
    originalJeansCount: 1.5,
    artisanDifficulty: 'Trung bình',
    measurements: {
      waist: '74 - 84 cm (Chun co giãn)',
      length: '48 cm'
    },
    sizes: ['M', 'L'],
    isOneOfOne: false,
    isBestSeller: false
  }
];

export const BRAND_VALUES = [
  {
    title: 'Upcycling (Tái sinh)',
    description: 'Tụi mình không mua vải cuộn mới. ECHOVE hồi sinh những chiếc quần jeans cũ rách, biến chúng thành những thiết kế streetwear độc bản đầy tính thẩm mỹ.',
    icon: 'RefreshCw'
  },
  {
    title: '1-of-1 (Độc bản)',
    description: 'Do đặc thù của denim đã qua sử dụng, mỗi sản phẩm làm ra đều có sắc độ phai màu, vết rách và cấu trúc ráp nối độc nhất. Sẽ không bao giờ có chiếc thứ hai giống hệt chiếc của bạn.',
    icon: 'Layers'
  },
  {
    title: 'Artisanal Craft (Thủ công)',
    description: 'Mỗi đường chỉ thô, vết cắt dập, khâu thêu nổi đều được những thợ may trẻ tại xưởng tụi mình làm hoàn toàn bằng tay với sự trân quý từng mảnh chất liệu.',
    icon: 'Hammer'
  },
  {
    title: 'Circular Vibe (Tuần hoàn)',
    description: 'Cùng cộng đồng thu gom denim cũ, giảm tải hàng ngàn lít nước và rác thải dệt may xả ra môi trường. Tạo một cộng đồng mặc chất, sống xanh.',
    icon: 'Globe'
  }
];

export const COMMUNITY_FEEDS = [
  {
    id: 1,
    username: '@quynh.denim',
    location: 'Hà Nội',
    image: 'https://picsum.photos/seed/community1/500/600',
    caption: 'Chiếc áo khoác Deconstructed mua từ đợt drop đầu tiên, mặc 2 năm rồi màu denim lên nước càng ngày càng đẹp càng bụi! ⚡ #echove #upcycled #denimhead',
    likes: 142
  },
  {
    id: 2,
    username: '@nam_indigo',
    location: 'Sài Gòn',
    image: 'https://picsum.photos/seed/community2/500/600',
    caption: 'Mix chiếc túi Sling Bag cùng oversized hoodie dạo phố đi bộ tối thứ 7. Nhìn chất chơi mà yên tâm vì đang góp phần cứu trái đất nha! 🌱🤘',
    likes: 208
  },
  {
    id: 3,
    username: '@echove.official',
    location: 'ECHOVE Lab',
    image: 'https://picsum.photos/seed/community3/500/600',
    caption: 'Góc xưởng nhỏ bận rộn ngày cuối tuần. Hàng trăm chiếc quần jeans quyên góp từ đợt vừa rồi đang được tụi mình phân loại, giặt giũ khử trùng chuẩn bị cho BST Reborn tiếp theo! Thân gửi ngàn lời yêu thương đến các donor.',
    likes: 315
  }
];

export const REBORN_PROCESS = [
  {
    step: '01',
    title: 'Thu gom & Tuyển lựa',
    description: 'Nhận quần jeans cũ quyên góp từ cộng đồng. Lọc chất liệu thô mộc, denim thật từ cotton 100% để đảm bảo phom dáng và tuổi thọ.'
  },
  {
    step: '02',
    title: 'Gột rửa & Diệt khuẩn',
    description: 'Giặt sấy công nghiệp ở nhiệt độ cao kết hợp giặt sinh học thân thiện môi trường để khử trùng tuyệt đối, làm mềm sợi vải cũ.'
  },
  {
    step: '03',
    title: 'Rã rập & Thiết kế',
    description: 'Thợ thiết kế khéo léo dùng lưỡi rạch tháo từng đường chỉ, phân tách quần jean cũ thành các mảnh ghép phẳng theo hình thù túi, đùi, cạp.'
  },
  {
    step: '04',
    title: 'Ráp nối độc bản',
    description: 'Sắp xếp tỉ mỉ phối màu sáng - tối, thô - mịn rồi khâu ghép thủ công bằng chỉ may siêu dai chuyên dụng. Cho ra đời một sản phẩm hoàn chỉnh.'
  }
];
