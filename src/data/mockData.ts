import { Topic, Lesson } from '../types';

export const INITIAL_TOPICS: Topic[] = [
  // LỚP 3
  {
    id: 'top-3-a',
    grade: 3,
    code: 'A',
    name: 'Chủ đề A: Máy tính và em',
    description: 'Làm quen với máy tính, các bộ phận, tư thế ngồi và gõ bàn phím đúng cách.',
    icon: '💻',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'top-3-b',
    grade: 3,
    code: 'B',
    name: 'Chủ đề B: Mạng máy tính và Internet',
    description: 'Bước đầu khám phá Internet và thế giới thông tin xung quanh.',
    icon: '🌐',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'top-3-c',
    grade: 3,
    code: 'C',
    name: 'Chủ đề C: Tổ chức lưu trữ, tìm kiếm thông tin',
    description: 'Sắp xếp đồ dùng và thông tin ngăn nắp, dễ tìm kiếm.',
    icon: '📁',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'top-3-e',
    grade: 3,
    code: 'E',
    name: 'Chủ đề E: Ứng dụng tin học',
    description: 'Tập vẽ tranh với Paint, giải trí và học tập cùng phần mềm máy tính.',
    icon: '🎨',
    color: 'from-emerald-500 to-teal-500',
  },

  // LỚP 4
  {
    id: 'top-4-a',
    grade: 4,
    code: 'A',
    name: 'Chủ đề A: Máy tính và em',
    description: 'Phần cứng và phần mềm, các thiết bị ngoại vi và an toàn khi sử dụng.',
    icon: '🖥️',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'top-4-b',
    grade: 4,
    code: 'B',
    name: 'Chủ đề B: Mạng máy tính và Internet',
    description: 'Tìm kiếm thông tin hữu ích trên Internet và phòng tránh nguy cơ.',
    icon: '🌍',
    color: 'from-sky-500 to-blue-600',
  },
  {
    id: 'top-4-e',
    grade: 4,
    code: 'E',
    name: 'Chủ đề E: Ứng dụng tin học',
    description: 'Soạn thảo văn bản tiếng Việt có dấu, chèn hình ảnh, tạo bài trình chiếu đơn giản.',
    icon: '📝',
    color: 'from-emerald-600 to-teal-600',
  },

  // LỚP 5
  {
    id: 'top-5-c',
    grade: 5,
    code: 'C',
    name: 'Chủ đề C: Tổ chức lưu trữ, tìm kiếm thông tin',
    description: 'Cây thư mục, phân loại dữ liệu khoa học và tìm kiếm nâng cao.',
    icon: '🗂️',
    color: 'from-amber-600 to-orange-600',
  },
  {
    id: 'top-5-d',
    grade: 5,
    code: 'D',
    name: 'Chủ đề D: Đạo đức, pháp luật số',
    description: 'Bản quyền nội dung, văn hóa ứng xử trên mạng xã hội và bảo mật tài khoản.',
    icon: '🛡️',
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'top-5-f',
    grade: 5,
    code: 'F',
    name: 'Chủ đề F: Giải quyết vấn đề với Scratch',
    description: 'Làm quen với thuật toán, câu lệnh khối và lập trình trò chơi hoạt hình vui nhộn.',
    icon: '🐱',
    color: 'from-rose-500 to-orange-500',
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  // ==========================================
  // LỚP 3 - BÀI 3: MÁY TÍNH - NHỮNG NGƯỜI BẠN MỚI
  // ==========================================
  {
    id: 'lesson-lop3-bai3',
    grade: 3,
    topicId: 'top-3-a',
    order: 1,
    title: 'Bài 3: Máy tính - Những người bạn mới',
    subtitle: 'Khám phá 4 bộ phận cơ bản của máy tính để bàn và cách thao tác chuột',
    description: 'Học sinh nhận biết và nêu được chức năng của 4 bộ phận cơ bản của máy tính để bàn: Thân máy, Màn hình, Bàn phím, Chuột.',
    coverImage: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
    isPublished: true,
    period: 'Tiết 1 & 2',
    status: 'published',
    materials: [
      {
        id: 'mat_1',
        title: 'Video Bài Giảng: Các Bộ Phận Của Máy Tính Để Bàn',
        type: 'youtube',
        url: 'https://www.youtube.com/watch?v=0hG-2tQtdlE',
        description: 'Bài giảng sinh động giúp học sinh nhận diện thân máy, màn hình, bàn phím và chuột.',
      },
      {
        id: 'mat_2',
        title: 'Bài Trình Chiếu PowerPoint (PPTX) Giảng Dạy',
        type: 'pptx',
        url: 'https://docs.google.com/presentation/d/e/2PACX-1vRdemo/pub?start=false',
        description: 'Slide trình chiếu bài giảng Kết nối tri thức có hình ảnh động và câu đố.',
      },
      {
        id: 'mat_3',
        title: 'Tài Liệu Phiếu Học Tập PDF (In cho học sinh)',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'Phiếu bài tập nối hình và tô màu các bộ phận máy tính.',
      },
    ],
    interactiveSimulations: [
      {
        id: 'sim_canvas_1',
        title: 'Mô phỏng Gemini Canvas: Thao Tác Chuột & Các Bộ Phận',
        url: 'https://scratch.mit.edu/projects/embed/10128407/',
        platform: 'gemini_canvas',
        instructions: 'Nhấn vào các bộ phận trên màn hình để nghe phát âm và tìm hiểu công dụng.',
      },
    ],
    mindMapImages: [
      {
        id: 'mm_img_1',
        title: 'Sơ Đồ Tư Duy: 4 Bộ Phận Cơ Bản Của Máy Tính Để Bàn',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
        caption: 'Sơ đồ tư duy trực quan giúp học sinh ghi nhớ nhanh vai trò từng bộ phận.',
      },
    ],
    externalGames: [
      {
        id: 'ext_game_1',
        title: 'Trò Chơi Wordwall: Ghép Nối 4 Bộ Phận Máy Tính',
        platform: 'wordwall',
        url: 'https://wordwall.net/embed/78e82ef620e74e6d87e07ebbfbe90c0f?themeId=1&templateId=3&fontStackId=0',
        instructions: 'Kéo thả tên bộ phận vào đúng hình ảnh minh họa trên màn hình.',
      },
    ],

    section1WarmUp: {
      storyOrQuestion: 'Hôm nay bạn Rô-bốt dẫn bạn Na và bạn Minh vào phòng thực hành Tin học. Na ngạc nhiên reo lên: "Ôi, chiếc máy tính để bàn có thật nhiều bộ phận kỳ diệu!" Bạn Minh thắc mắc: "Không biết bộ phận nào giúp máy tính suy nghĩ nhỉ?"',
      mediaType: 'riddle',
      riddleQuestion: 'Đố em: "Có mắt ngắm nhìn mọi nơi, có hộp thông minh chứa bao điều diệu kì, có phím em gõ từng lời, có chú chuột nhỏ chạy tới chạy lui?" Đó là bạn nào?',
      riddleAnswer: 'Đáp án: Chiếc Máy tính để bàn thông minh!',
      riddleHint: 'Đây là người bạn điện tử quen thuộc trong phòng thực hành Tin học của chúng mình đấy!',
    },

    section2Knowledge: {
      cards: [
        {
          id: 'card-3-1',
          title: '1. Thân máy tính (Bộ não của máy tính)',
          summary: 'Thân máy là một chiếc hộp chứa bộ xử lý trung tâm (CPU), có nhiệm vụ lưu trữ và xử lý mọi thông tin.',
          details: 'Thân máy giống như "bộ não" của con người. Bên trong thân máy có bộ vi xử lý giúp tính toán, mở video, chạy trò chơi và lưu giữ bài tập của em. Trên thân máy có nút nguồn để bật máy tính.',
          keyMemory: 'Thân máy = Bộ não chỉ huy, xử lý mọi dữ liệu!',
          imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-3-2',
          title: '2. Màn hình (Cửa sổ hiển thị hình ảnh)',
          summary: 'Màn hình giúp hiển thị kết quả làm việc của máy tính, chữ viết, tranh vẽ và video.',
          details: 'Màn hình máy tính tương tự như màn hình tivi ở nhà. Nhờ có màn hình, em có thể nhìn thấy chữ mình vừa gõ, xem phim hoạt hình và đọc truyện tranh sinh động.',
          keyMemory: 'Màn hình = Cửa sổ hiển thị kết quả làm việc ra mắt em!',
          imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-3-3',
          title: '3. Bàn phím & Chuột (Người gửi lệnh cho máy)',
          summary: 'Bàn phím dùng để gõ chữ, số. Chuột máy tính giúp điều khiển con trỏ trên màn hình nhanh chóng.',
          details: 'Bàn phím gồm nhiều phím bấm có chữ cái A, B, C và số 0-9. Khi em gõ phím, chữ sẽ hiện trên màn hình. Chuột máy tính nằm vừa vặn trong lòng bàn tay phải, có nút trái, nút phải và bánh lăn để cuộn trang.',
          keyMemory: 'Bàn phím & Chuột = Đôi tay đưa thông tin và câu lệnh vào máy tính!',
          imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },

    section3MindMap: {
      rootTitle: 'BỐN BỘ PHẬN MÁY TÍNH',
      externalMindMapUrl: 'https://coggle.it/diagram/Zg1m2_demo/t/may-tinh-va-em',
      externalMindMapTitle: 'Sơ đồ tư duy tương tác Coggle: 4 bộ phận máy tính',
      allowEmbed: true,
      branches: [
        {
          id: 'b1',
          title: '🧠 Thân máy tính',
          color: '#3B82F6',
          icon: 'box',
          externalLink: 'https://coggle.it',
          children: [
            { id: 'b1-1', title: 'Chứa bộ vi xử lý (CPU)', details: 'Xử lý các phép tính và câu lệnh' },
            { id: 'b1-2', title: 'Nút nguồn (Power)', details: 'Dùng để khởi động máy tính' },
            { id: 'b1-3', title: 'Vai trò: Bộ não điều khiển', details: 'Quan trọng nhất của bộ máy' },
          ],
        },
        {
          id: 'b2',
          title: '🖥️ Màn hình',
          color: '#10B981',
          icon: 'monitor',
          children: [
            { id: 'b2-1', title: 'Hiển thị chữ và số', details: 'Xem những gì em vừa gõ' },
            { id: 'b2-2', title: 'Hiển thị hình ảnh, video', details: 'Rực rỡ sắc màu, dễ quan sát' },
            { id: 'b2-3', title: 'Khoảng cách an toàn', details: 'Ngồi cách màn hình từ 50-80cm' },
          ],
        },
        {
          id: 'b3',
          title: '⌨️ Bàn phím',
          color: '#F59E0B',
          icon: 'keyboard',
          children: [
            { id: 'b3-1', title: 'Gõ ký tự, chữ, số', details: 'Đưa thông tin văn bản vào máy' },
            { id: 'b3-2', title: 'Hàng phím cơ sở', details: 'Hai phím F và J có gờ nổi' },
          ],
        },
        {
          id: 'b4',
          title: '🖱️ Chuột máy tính',
          color: '#EC4899',
          icon: 'mouse',
          children: [
            { id: 'b4-1', title: 'Nút trái, nút phải, con lăn', details: 'Các thao tác bấm đơn, bấm đúp' },
            { id: 'b4-2', title: 'Điều khiển con trỏ', details: 'Di chuyển con trỏ chuột trên màn hình' },
          ],
        },
      ],
    },

    section4Simulation: {
      simulations: [
        {
          id: 'sim-mouse-1',
          title: 'Thực hành thao tác Chuột máy tính vui nhộn',
          type: 'built_in_mouse',
          instructions: 'Hãy cầm chuột đúng cách: Ngón trỏ đặt lên nút trái, ngón giữa đặt lên nút phải. Thực hành Nhấp đơn, Nhấp đúp và Kéo thả quả táo vào giỏ!',
        },
        {
          id: 'sim-keyboard-intro',
          title: 'Thực hành gõ hàng phím cơ sở (F, J, A, S, D...)',
          type: 'built_in_keyboard',
          instructions: 'Đặt hai ngón tay trỏ lên 2 phím có gờ nổi là F và J. Nhấn các phím hiện trên màn hình thật chuẩn xác nhé!',
        },
      ],
    },

    section5Games: {
      gameType: 'quiz',
      questions: [
        {
          id: 'q3-1',
          question: 'Bộ phận nào được ví như "bộ não" của chiếc máy tính?',
          type: 'singleChoice',
          options: ['A. Màn hình', 'B. Thân máy tính', 'C. Bàn phím', 'D. Chuột máy tính'],
          correctAnswer: 1,
          explanation: 'Thân máy tính chứa bộ xử lý trung tâm (CPU), lưu trữ và xử lý mọi thông tin giống như bộ não con người.',
        },
        {
          id: 'q3-2',
          question: 'Những thiết bị nào sau đây thuộc 4 bộ phận cơ bản của máy tính để bàn? (Chọn tất cả các đáp án đúng)',
          type: 'multipleChoice',
          options: ['A. Thân máy tính', 'B. Bàn phím', 'C. Nồi cơm điện', 'D. Chuột máy tính', 'E. Màn hình máy tính'],
          correctAnswers: [0, 1, 3, 4],
          correctAnswer: 0,
          explanation: '4 bộ phận cơ bản của máy tính để bàn gồm: Thân máy, Màn hình, Bàn phím và Chuột.',
        },
        {
          id: 'q3-3',
          question: 'Màn hình máy tính là thiết bị dùng để gõ chữ và đưa thông tin vào máy tính. Nhận định này là Đúng hay Sai?',
          type: 'trueFalse',
          isTrue: false,
          correctAnswer: 0,
          explanation: 'Sai! Màn hình là thiết bị xuất để hiển thị thông tin ra ngoài. Bàn phím mới là thiết bị dùng để gõ chữ và số.',
        },
        {
          id: 'q3-4',
          question: 'Hai phím có gờ nổi trên hàng phím cơ sở để đặt 2 ngón tay trỏ là phím F và phím J.',
          type: 'fillBlank',
          blankPromptPrefix: 'Hai phím có gờ nổi trên hàng phím cơ sở để đặt hai ngón tay trỏ là phím',
          blankPromptSuffix: 'và phím J.',
          correctText: 'F',
          wordBank: ['F', 'A', 'Space', 'Enter'],
          explanation: 'Hai phím F và J trên hàng phím cơ sở có gờ nổi nhỏ giúp học sinh định vị ngón tay trỏ khi gõ phím mà không cần nhìn.',
        },
        {
          id: 'q3-5',
          question: 'Em hãy nối tên từng bộ phận máy tính với chức năng tương ứng:',
          type: 'matching',
          pairs: [
            { id: 'p1', left: 'Thân máy', right: 'Bộ não xử lý dữ liệu' },
            { id: 'p2', left: 'Màn hình', right: 'Hiển thị kết quả làm việc' },
            { id: 'p3', left: 'Bàn phím', right: 'Gõ ký tự chữ và số' },
            { id: 'p4', left: 'Chuột máy tính', right: 'Điều khiển con trỏ trên màn hình' },
          ],
          explanation: 'Mỗi bộ phận của máy tính phối hợp với nhau để giúp em học tập và giải trí hiệu quả.',
        },
        {
          id: 'q3-6',
          question: 'Em hãy phân loại các thiết bị vào đúng 2 nhóm: "Thiết bị Vào (Nhập)" và "Thiết bị Xuất (Ra)":',
          type: 'dragDrop',
          categories: ['Thiết bị Vào (Nhập)', 'Thiết bị Xuất (Ra)'],
          itemsToCategorize: [
            { id: 'dd1', text: 'Bàn phím', category: 'Thiết bị Vào (Nhập)' },
            { id: 'dd2', text: 'Chuột máy tính', category: 'Thiết bị Vào (Nhập)' },
            { id: 'dd3', text: 'Màn hình', category: 'Thiết bị Xuất (Ra)' },
            { id: 'dd4', text: 'Loa máy tính', category: 'Thiết bị Xuất (Ra)' },
            { id: 'dd5', text: 'Máy in', category: 'Thiết bị Xuất (Ra)' },
          ],
          explanation: 'Thiết bị vào giúp đưa dữ liệu vào máy, thiết bị xuất đưa kết quả ra ngoài cho con người quan sát hoặc nghe.',
        },
        {
          id: 'q3-7',
          question: 'Sắp xếp theo đúng trình tự các bước để bật máy tính để bàn an toàn:',
          type: 'ordering',
          orderItems: [
            { id: 'ord1', text: 'Bước 1: Bật công tắc nguồn của Màn hình' },
            { id: 'ord2', text: 'Bước 2: Bấm nút Công tắc nguồn trên Thân máy' },
            { id: 'ord3', text: 'Bước 3: Chờ máy khởi động vào màn hình chính Windows' },
          ],
          correctOrder: ['ord1', 'ord2', 'ord3'],
          explanation: 'Quy tắc chuẩn: Bật công tắc màn hình trước, sau đó bấm nút nguồn thân máy và chờ khởi động xong.',
        },
        {
          id: 'q3-8',
          question: 'Quan sát các hình dưới đây và chọn hình ảnh chiếc Chuột máy tính (Mouse):',
          type: 'imageSelect',
          imageOptions: [
            { id: 'img_screen', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80', label: 'Màn hình máy tính', isCorrect: false },
            { id: 'img_mouse', imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&q=80', label: 'Chuột máy tính', isCorrect: true },
            { id: 'img_keyboard', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80', label: 'Bàn phím', isCorrect: false },
            { id: 'img_case', imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&q=80', label: 'Thân máy tính', isCorrect: false },
          ],
          correctAnswer: 'img_mouse',
          explanation: 'Hình thứ 2 là chiếc chuột máy tính dùng để điều khiển con trỏ trên màn hình.',
        },
        {
          id: 'q3-9',
          question: 'Tìm từ ngữ SAI: Trong câu quy tắc an toàn phòng máy tính dưới đây, từ nào là SAI?',
          type: 'findError',
          errorText: 'Học sinh được phép vừa ăn bánh kẹo vừa gõ phím máy tính.',
          errorOptions: ['Học sinh', 'được phép', 'vừa ăn bánh kẹo', 'vừa gõ phím'],
          correctAnswer: 'được phép',
          correctCorrection: 'KHÔNG ĐƯỢC PHÉP ăn uống khi đang ngồi trước máy tính.',
          explanation: 'Tuyệt đối KHÔNG ĐƯỢC ăn uống trong phòng máy vì vụn bánh và nước đổ sẽ gây hư hỏng thiết bị và nguy hiểm chập điện.',
        },
        {
          id: 'q3-10',
          question: 'Em nên làm gì trong tình huống này?',
          type: 'scenario',
          scenarioContext: 'Tình huống: Khi đang thực hành môn Tin học, bạn bên cạnh vô tình làm đổ nước lên bàn học gần giắc cắm nguồn điện.',
          options: [
            'A. Tự lấy tay lau giắc điện và cắm lại',
            'B. Báo ngay với thầy cô giáo phụ trách và không chạm tay vào chỗ có nước (Đúng)',
            'C. Cắm lại dây nguồn thử xem máy có chạy không',
            'D. Mặc kệ và tiếp tục chơi game',
          ],
          correctAnswer: 1,
          explanation: 'Khi gặp sự cố rò rỉ nước gần thiết bị điện, cần báo ngay cho thầy cô giáo để ngắt điện an toàn, tránh điện giật nguy hiểm.',
        },
        {
          id: 'q3-11',
          question: 'Em hãy quan sát sơ đồ máy tính và nhấp chọn vào vị trí của [MÀN HÌNH MÁY TÍNH]:',
          type: 'clickPosition',
          targetAreaName: 'Màn hình máy tính',
          imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&q=80',
          clickHotspots: [
            { id: 'spot_screen', label: 'Màn hình', x: 48, y: 38, isTarget: true },
            { id: 'spot_case', label: 'Thân máy', x: 82, y: 50, isTarget: false },
            { id: 'spot_keyboard', label: 'Bàn phím', x: 42, y: 78, isTarget: false },
            { id: 'spot_mouse', label: 'Chuột máy tính', x: 72, y: 78, isTarget: false },
          ],
          explanation: 'Màn hình máy tính nằm ở trung tâm giúp hiển thị toàn bộ kết quả làm việc của em.',
        },
        {
          id: 'q3-12',
          question: 'Quan sát clip hướng dẫn tư thế ngồi gõ bàn phím chuẩn và trả lời: Khi ngồi trước máy tính, lưng của em cần ở trạng thái nào?',
          type: 'mediaBased',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          options: [
            'A. Ngồi thẳng lưng, mắt cách màn hình từ 50cm đến 80cm (Đúng)',
            'B. Cúi gập sát mặt vào màn hình máy tính',
            'C. Nằm bò ra bàn phím',
            'D. Ngồi vẹo sang một bên',
          ],
          correctAnswer: 0,
          explanation: 'Tư thế ngồi chuẩn: Ngồi thẳng lưng, hai bàn chân đặt trên sàn, mắt nhìn ngang màn hình cách 50-80cm để bảo vệ cột sống và thị lực.',
        },
      ],
    },

    section6AIConfig: {
      enabled: true,
      difficulty: 'easy',
      keyTakeaways: [
        'Máy tính để bàn gồm 4 bộ phận: Thân máy, Màn hình, Bàn phím, Chuột.',
        'Thân máy là bộ não xử lý thông tin.',
        'Màn hình hiển thị kết quả làm việc.',
        'Bàn phím và Chuột giúp con người nhập thông tin và ra lệnh cho máy tính.',
      ],
      starterPrompts: [
        'Tại sao thân máy lại được gọi là bộ não của máy tính?',
        'Nếu không có màn hình thì máy tính có hoạt động được không?',
        'Cách cầm chuột máy tính như thế nào là đúng nhất?',
        'Hãy đố em một câu hỏi vui về 4 bộ phận máy tính nhé!',
      ],
      sampleDialogues: [
        {
          user: 'Robot ơi, tại sao thân máy lại gọi là bộ não?',
          robot: '🤖 Chào bạn nhỏ đáng yêu! Vì trong thân máy có một vi mạch nhỏ xíu tên là CPU, giống như bộ não của chúng mình vậy. Nó tính toán mọi phép tính, ghi nhớ bài học và bảo các bộ phận khác làm việc đó! Em có muốn biết nút nào trên thân máy để bật máy tính không?',
        },
        {
          user: 'Có phải nút to hình tròn trên thân máy không ạ?',
          robot: '🤖 Hoan hô em! Chính xác 100%! Đó là Nút Nguồn (Power button). Khi nhấn nút đó, chiếc máy tính sẽ bừng tỉnh để học tập cùng em đấy! 🌟',
        },
      ],
    },
  },

  // ==========================================
  // LỚP 3 - BÀI 6: TẬP GÕ BÀN PHÍM ĐÚNG CÁCH
  // ==========================================
  {
    id: 'lesson-lop3-bai6',
    grade: 3,
    topicId: 'top-3-a',
    order: 2,
    title: 'Bài 6: Tập gõ bàn phím đúng cách',
    subtitle: 'Khám phá hàng phím cơ sở và quy tắc đặt 10 ngón tay trên bàn phím',
    description: 'Học sinh biết vị trí của hàng phím cơ sở, hai phím mốc F và J có gờ nổi, và luyện tập đặt 10 ngón tay đúng vị trí.',
    coverImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    isPublished: true,
    isDemo: true,
    objectives: [
      'Xác định được hàng phím cơ sở trên khu vực phím chính.',
      'Chỉ ra 2 phím mốc F và J có gờ nổi dành cho hai ngón tay trỏ.',
      'Ghi nhớ phân công 10 ngón tay trên hàng phím cơ sở: A S D F - J K L ;',
      'Thực hành gõ phím nhẹ nhàng, không dùng lực quá mạnh.',
    ],

    section1WarmUp: {
      storyOrQuestion: 'Bạn Rô-bốt nhìn thấy bạn Na gõ bàn phím bằng một ngón trỏ "mổ cò" rất vất vả. Rô-bốt mỉm cười bảo: "Na ơi, nếu bạn dùng cả 10 ngón tay giống như người nghệ sĩ đánh đàn piano, bạn sẽ gõ nhanh như chớp đấy!"',
      mediaType: 'riddle',
      riddleQuestion: 'Đố em: "Hai phím đặc biệt trên hàng cơ sở, có gờ nổi tí hon để ngón trỏ tìm về mà không cần nhìn bàn phím?" Đó là phím nào?',
      riddleAnswer: 'Đáp án: Phím F và phím J!',
      riddleHint: 'Em hãy thử sờ nhẹ lên phím chữ F và phím chữ J trên bàn phím xem có điều gì kỳ diệu không nhé!',
    },

    section2Knowledge: {
      cards: [
        {
          id: 'card-36-1',
          title: '1. Khu vực chính và Hàng phím cơ sở',
          summary: 'Hàng phím cơ sở là hàng phím ở giữa khu vực phím chính, nơi 10 ngón tay luôn sẵn sàng xuất phát.',
          details: 'Bàn phím có nhiều hàng phím: Hàng phím số, Hàng phím trên, Hàng phím cơ sở, Hàng phím dưới và Hàng phím chứa phím cách (Space). Trong đó hàng phím cơ sở là quan trọng nhất.',
          keyMemory: 'Hàng phím cơ sở là "ngôi nhà xuất phát" của 10 ngón tay!',
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-36-2',
          title: '2. Hai phím có gờ mốc: F và J',
          summary: 'Trên phím F và phím J có một gờ nổi nhỏ giúp ngón trỏ định vị mà không cần nhìn xuống bàn phím.',
          details: 'Ngón trỏ tay trái đặt lên phím F. Ngón trỏ tay phải đặt lên phím J. Khi cần gõ các phím khác, ngón tay vươn ra rồi lại rút về phím cơ sở.',
          keyMemory: 'Ngón trỏ trái = Phím F | Ngón trỏ phải = Phím J (Hai phím có gờ nổi)!',
          imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-36-3',
          title: '3. Phân công 10 ngón tay trên hàng cơ sở',
          summary: 'Tay trái: Út (A), Nhẫn (S), Giữa (D), Trỏ (F). Tay phải: Trỏ (J), Giữa (K), Nhẫn (L), Út (;). Hai ngón cái đặt trên phím Cách (Space).',
          details: 'Ngồi thẳng lưng, mắt hướng về màn hình, thả lỏng cổ tay. Gõ nhẹ dứt khoát vào giữa phím.',
          keyMemory: 'Tay trái: A-S-D-F | Tay phải: J-K-L-; | Ngón cái: Phím Cách!',
          imageUrl: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },

    section3MindMap: {
      rootTitle: 'GÕ BÀN PHÍM 10 NGÓN',
      rootSubtitle: 'Hàng phím cơ sở chuẩn SGK',
      branches: [
        {
          id: 'b-kb-1',
          title: '✋ Bàn tay trái',
          color: '#3B82F6',
          children: [
            { id: 'b-kb-11', title: 'Ngón út: Phím A', details: 'Gõ chữ A và phím Shift bên trái' },
            { id: 'b-kb-12', title: 'Ngón áp út: Phím S', details: 'Đặt ngay ngắn trên phím S' },
            { id: 'b-kb-13', title: 'Ngón giữa: Phím D', details: 'Đặt trên phím D' },
            { id: 'b-kb-14', title: 'Ngón trỏ: Phím F (Có gờ)', details: 'Phím mốc xuất phát của tay trái' },
          ],
        },
        {
          id: 'b-kb-2',
          title: '🤚 Bàn tay phải',
          color: '#10B981',
          children: [
            { id: 'b-kb-21', title: 'Ngón trỏ: Phím J (Có gờ)', details: 'Phím mốc xuất phát của tay phải' },
            { id: 'b-kb-22', title: 'Ngón giữa: Phím K', details: 'Đặt trên phím K' },
            { id: 'b-kb-23', title: 'Ngón áp út: Phím L', details: 'Đặt trên phím L' },
            { id: 'b-kb-24', title: 'Ngón út: Phím chấm phẩy (;)', details: 'Đặt trên phím dấu chấm phẩy' },
          ],
        },
        {
          id: 'b-kb-3',
          title: '👍 Hai ngón tay cái',
          color: '#F59E0B',
          children: [
            { id: 'b-kb-31', title: 'Phím Cách (Spacebar)', details: 'Dùng để tạo khoảng trống giữa hai từ' },
          ],
        },
      ],
    },

    section4Simulation: {
      simulations: [
        {
          id: 'sim-keyboard-practice',
          title: 'Mô phỏng luyện gõ 10 ngón trên máy tính',
          type: 'built_in_keyboard',
          instructions: 'Đặt đúng các ngón tay và bấm các phím theo thứ tự hiển thị để tích luỹ sao vàng!',
        },
      ],
    },

    section5Games: {
      gameType: 'quiz',
      questions: [
        {
          id: 'q36-1',
          question: 'Hai phím nào trên hàng cơ sở có gờ nổi để đặt ngón tay trỏ?',
          type: 'multiple_choice',
          options: ['A. Phím A và Phím L', 'B. Phím F và Phím J', 'C. Phím D và Phím K', 'D. Phím S và Phím J'],
          correctAnswer: 1,
          explanation: 'Chính xác! Phím F (tay trái) và phím J (tay phải) có gờ nổi nhỏ giúp định vị vị trí tay.',
        },
        {
          id: 'q36-2',
          question: 'Hai ngón tay cái được phân công đặt ở phím nào trên bàn phím?',
          type: 'multiple_choice',
          options: ['A. Phím Enter', 'B. Phím Shift', 'C. Phím Cách (Spacebar)', 'D. Phím Caps Lock'],
          correctAnswer: 2,
          explanation: 'Hai ngón tay cái đặt nhẹ trên phím dài nhất bàn phím - đó là Phím Cách (Spacebar).',
        },
        {
          id: 'q36-3',
          question: 'Ngón út bàn tay trái phụ trách phím nào trên hàng cơ sở?',
          type: 'multiple_choice',
          options: ['A. Phím A', 'B. Phím S', 'C. Phím D', 'D. Phím F'],
          correctAnswer: 0,
          explanation: 'Ngón út bàn tay trái đặt trên phím A.',
        },
        {
          id: 'q36-4',
          question: 'Tư thế ngồi gõ bàn phím nào sau đây là ĐÚNG?',
          type: 'multiple_choice',
          options: ['A. Ngồi cúi sát mặt vào màn hình', 'B. Ngồi thẳng lưng, mắt cách màn hình 50-80cm', 'C. Nằm bò ra bàn để gõ phím', 'D. Ngồi vẹo sang một bên'],
          correctAnswer: 1,
          explanation: 'Ngồi thẳng lưng giúp bảo vệ cột sống và giữ khoảng cách 50-80cm giúp mắt không bị cận thị.',
        },
      ],
    },

    section6AIConfig: {
      enabled: true,
      difficulty: 'easy',
      keyTakeaways: [
        'Hàng cơ sở gồm các phím: A S D F G H J K L ;',
        'Hai phím có gờ nổi là F và J.',
        'Hai ngón cái phụ trách phím Cách (Space).',
      ],
      starterPrompts: [
        'Tại sao trên phím F và J lại có gờ nổi nhỏ xíu vậy Robot?',
        'Làm sao để em gõ phím nhanh hơn mà không cần nhìn bàn phím?',
        'Robot hãy đố em vị trí ngón tay của từng phím nhé!',
      ],
      sampleDialogues: [
        {
          user: 'Robot ơi, tại sao lại có gờ trên phím F và J?',
          robot: '🤖 Câu hỏi thông minh lắm bạn nhỏ! Gờ nổi trên phím F và J như "ngọn hải đăng" dẫn đường cho hai ngón tay trỏ của em đấy! Khi em đặt ngón tay sờ thấy gờ nổi là biết ngay tay mình đang ở đúng hàng phím cơ sở mà không cần cúi đầu nhìn xuống bàn phím! Thật kì diệu phải không nào? 💡',
        },
      ],
    },
  },

  // ==========================================
  // LỚP 4 - BÀI 1: PHẦN CỨNG VÀ PHẦN MỀM MÁY TÍNH
  // ==========================================
  {
    id: 'lesson-lop4-bai1',
    grade: 4,
    topicId: 'top-4-a',
    order: 1,
    title: 'Bài 1: Phần cứng và phần mềm máy tính',
    subtitle: 'Phân biệt những bộ phận em có thể chạm vào và các chương trình thông minh bên trong',
    description: 'Học sinh phân biệt được phần cứng (Hardware) và phần mềm (Software) của máy tính, nêu được mối quan hệ gắn bó giữa chúng.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    isPublished: true,
    isDemo: true,
    objectives: [
      'Nêu được khái niệm phần cứng và phần mềm máy tính.',
      'Lấy được ví dụ cụ thể về phần cứng (chuột, bàn phím, màn hình, loa, máy in, ổ cứng...).',
      'Lấy được ví dụ cụ thể về phần mềm (phần mềm vẽ Paint, phần mềm gõ Word, trò chơi học tập...).',
      'Hiểu được phần cứng và phần mềm phải kết hợp nhịp nhàng thì máy tính mới hoạt động được.',
    ],

    section1WarmUp: {
      storyOrQuestion: 'Bạn An mua một chiếc máy tính mới tinh rất đẹp về nhà, cắm điện lên nhưng máy chưa được cài bất kỳ chương trình nào. An hỏi bố: "Bố ơi, máy tính có thân máy và màn hình rồi, sao con không vẽ tranh hay nghe nhạc được ạ?" Bố An cười bảo: "Vì máy tính của con mới có thể xác mà chưa có tâm hồn đấy!"',
      mediaType: 'riddle',
      riddleQuestion: 'Đố em: "Em sờ thấy được bằng tay, gọi tên là CỨNG mỗi ngày quanh ta; Còn điều điều khiển mượt mà, MỀM là chương trình mở ra muôn màu?" Đó là hai khái niệm nào?',
      riddleAnswer: 'Đáp án: Phần cứng (Hardware) và Phần mềm (Software)!',
      riddleHint: 'Một bên là các thiết bị vật lý chạm vào được, một bên là các phần mềm ứng dụng thông minh.',
    },

    section2Knowledge: {
      cards: [
        {
          id: 'card-41-1',
          title: '1. Phần cứng (Hardware) là gì?',
          summary: 'Phần cứng là các thiết bị vật lý cấu tạo nên máy tính mà em có thể nhìn thấy và chạm tay vào được.',
          details: 'Ví dụ về phần cứng: Thân máy tính, màn hình, bàn phím, chuột, loa, tai nghe, máy in, máy quét, thẻ nhớ USB, micro...',
          keyMemory: 'Phần cứng = Thiết bị vật lý sờ thấy, nhìn thấy được!',
          imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-41-2',
          title: '2. Phần mềm (Software) là gì?',
          summary: 'Phần mềm là các chương trình máy tính được cài đặt bên trong, giúp con người thực hiện các công việc cụ thể.',
          details: 'Ví dụ về phần mềm: Hệ điều hành Windows, phần mềm vẽ tranh Paint, phần mềm soạn thảo Word, trình duyệt Internet Google Chrome, phần mềm luyện gõ RapidTyping, phần mềm Scratch...',
          keyMemory: 'Phần mềm = Các chương trình, ứng dụng chạy bên trong máy tính!',
          imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-41-3',
          title: '3. Mối quan hệ giữa Phần cứng và Phần mềm',
          summary: 'Phần cứng và phần mềm không thể tách rời: Phần cứng là nơi cài đặt và chạy phần mềm; Phần mềm điều khiển phần cứng hoạt động.',
          details: 'Ví dụ: Chiếc đàn ghi-ta là phần cứng, bản nhạc và người nghệ sĩ chơi đàn là phần mềm. Nếu không có phần mềm, máy tính chỉ là một khối kim loại bất động!',
          keyMemory: 'Phần cứng + Phần mềm = Máy tính hoạt động thông minh!',
          imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },

    section3MindMap: {
      rootTitle: 'HỆ THỐNG MÁY TÍNH',
      externalMindMapUrl: 'https://coggle.it/diagram/Y2_demo_hw_sw/t/phan-cung-phan-mem',
      externalMindMapTitle: 'Sơ đồ tư duy Coggle: Phần cứng & Phần mềm Tin học 4',
      allowEmbed: true,
      branches: [
        {
          id: 'b4-hw',
          title: '🔩 PHẦN CỨNG (Hardware)',
          color: '#3B82F6',
          externalLink: 'https://coggle.it',
          children: [
            { id: 'b4-hw1', title: 'Thiết bị vào (Input)', details: 'Bàn phím, Chuột, Micro, Máy quét' },
            { id: 'b4-hw2', title: 'Thiết bị xử lý & lưu trữ', details: 'CPU, Bo mạch chủ, Ổ cứng, Ổ USB' },
            { id: 'b4-hw3', title: 'Thiết bị ra (Output)', details: 'Màn hình, Loa, Tai nghe, Máy in' },
          ],
        },
        {
          id: 'b4-sw',
          title: '💿 PHẦN MỀM (Software)',
          color: '#10B981',
          children: [
            { id: 'b4-sw1', title: 'Phần mềm hệ thống', details: 'Hệ điều hành Windows, macOS, Linux, Android' },
            { id: 'b4-sw2', title: 'Phần mềm ứng dụng học tập', details: 'Paint (vẽ tranh), Word (soạn thảo), Scratch (lập trình)' },
            { id: 'b4-sw3', title: 'Trình duyệt Web', details: 'Google Chrome, Microsoft Edge, Cốc Cốc' },
          ],
        },
      ],
    },

    section4Simulation: {
      simulations: [
        {
          id: 'sim-hw-sw-sorting',
          title: 'Mô phỏng phân loại Phần cứng vs Phần mềm',
          type: 'built_in_mouse',
          instructions: 'Hãy dùng chuột kéo các đồ vật vào đúng hai chiếc hộp: Hộp "Phần cứng" và Hộp "Phần mềm"!',
        },
      ],
    },

    section5Games: {
      gameType: 'drag_drop',
      questions: [
        {
          id: 'q41-1',
          question: 'Vật nào dưới đây là ví dụ về PHẦN CỨNG của máy tính?',
          type: 'multiple_choice',
          options: ['A. Phần mềm vẽ tranh Paint', 'B. Bàn phím máy tính', 'C. Trò chơi Scratch', 'D. Trình duyệt Google Chrome'],
          correctAnswer: 1,
          explanation: 'Bàn phím là thiết bị vật lý có thể chạm vào được, nên nó là Phần cứng.',
        },
        {
          id: 'q41-2',
          question: 'Cái nào dưới đây là PHẦN MỀM máy tính?',
          type: 'multiple_choice',
          options: ['A. Chuột không dây', 'B. Màn hình máy tính', 'C. Hệ điều hành Windows 11', 'D. Chiếc tai nghe'],
          correctAnswer: 2,
          explanation: 'Hệ điều hành Windows 11 là tập hợp các chương trình điều khiển máy tính, thuộc về Phần mềm.',
        },
        {
          id: 'q41-3',
          question: 'Nếu máy tính chỉ có phần cứng mà không cài đặt phần mềm nào thì điều gì xảy ra?',
          type: 'multiple_choice',
          options: ['A. Máy tính vẫn tự động soạn thảo văn bản', 'B. Máy tính không thể làm việc được', 'C. Máy tính tự chơi trò chơi', 'D. Máy tính tự in tranh ảnh'],
          correctAnswer: 1,
          explanation: 'Không có phần mềm, phần cứng không có lệnh chỉ huy nên máy tính không thể làm việc được.',
        },
        {
          id: 'q41-4',
          question: 'Thiết bị nào sau đây vừa là phần cứng vừa là THIẾT BỊ VÀO (đưa thông tin vào máy)?',
          type: 'multiple_choice',
          options: ['A. Màn hình', 'B. Loa nghe nhạc', 'C. Bàn phím', 'D. Máy in giấy'],
          correctAnswer: 2,
          explanation: 'Bàn phím là thiết bị vào, giúp người dùng gõ chữ đưa thông tin vào máy.',
        },
      ],
    },

    section6AIConfig: {
      enabled: true,
      difficulty: 'medium',
      keyTakeaways: [
        'Phần cứng: Nhìn thấy, sờ được (chuột, bàn phím, màn hình, thân máy...).',
        'Phần mềm: Các chương trình chạy bên trong (Paint, Word, Windows...).',
        'Phần cứng và phần mềm phải phối hợp cùng nhau để phục vụ con người.',
      ],
      starterPrompts: [
        'Robot ơi, loa máy tính là phần cứng hay phần mềm?',
        'Trò chơi em chơi trên máy tính là phần cứng hay phần mềm?',
        'Có loại máy tính nào không cần phần mềm không Robot?',
      ],
      sampleDialogues: [
        {
          user: 'Robot ơi, chiếc điện thoại thông minh của mẹ em có phần cứng và phần mềm không?',
          robot: '🤖 Có chứ em ơi! Điện thoại thông minh thực chất là một chiếc máy tính thu nhỏ. Màn hình cảm ứng, vỏ máy, camera là Phần cứng. Còn ứng dụng Zalo, Youtube, phần mềm chụp ảnh chính là Phần mềm đó! Bạn nhỏ liên hệ thực tế rất giỏi! 👏',
        },
      ],
    },
  },

  // ==========================================
  // LỚP 5 - BÀI 2: CÂY THƯ MỤC VÀ LƯU TRỮ THÔNG TIN KHOA HỌC
  // ==========================================
  {
    id: 'lesson-lop5-bai2',
    grade: 5,
    topicId: 'top-5-c',
    order: 1,
    title: 'Bài 2: Cây thư mục và lưu trữ thông tin khoa học',
    subtitle: 'Tổ chức sắp xếp tệp và thư mục ngăn nắp như một giá sách thông minh',
    description: 'Học sinh hiểu cấu trúc cây thư mục (thư mục gốc, thư mục con, tệp tin), biết cách tạo, đổi tên, di chuyển và sắp xếp dữ liệu khoa học.',
    coverImage: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=800&auto=format&fit=crop&q=80',
    isPublished: true,
    isDemo: true,
    objectives: [
      'Hiểu khái niệm thư mục (Folder) và tệp tin (File).',
      'Mô tả được cấu trúc dạng cây của thư mục trên máy tính.',
      'Biết cách đặt tên tệp và thư mục gợi nhớ, không chứa ký tự đặc biệt.',
      'Thực hành tạo thư mục con, sao chép và di chuyển tệp vào đúng thư mục.',
    ],

    section1WarmUp: {
      storyOrQuestion: 'Bạn Nam lưu tất cả bài tập Toán, tranh vẽ Mỹ thuật, bài hát Tiếng Anh ra ngoài màn hình chính (Desktop). Màn hình của Nam kín đặc hàng trăm biểu tượng hỗn độn. Khi cô giáo yêu cầu nộp bài vẽ hôm qua, Nam tìm mãi không thấy! Nam cầu cứu Robot Tin Học.',
      mediaType: 'riddle',
      riddleQuestion: 'Đố em: "Ngăn kéo màu vàng xinh xắn, chứa đựng bao nhiêu bài hay; Trong ngăn lại có ngăn nhỏ, tìm đâu thấy đó ngay tức thì?" Đó là gì?',
      riddleAnswer: 'Đáp án: Thư mục (Folder) trên máy tính!',
      riddleHint: 'Biểu tượng của nó thường có màu vàng như một chiếc bìa kẹp hồ sơ.',
    },

    section2Knowledge: {
      cards: [
        {
          id: 'card-52-1',
          title: '1. Tệp (File) và Thư mục (Folder)',
          summary: 'Tệp là nơi chứa thông tin cụ thể (văn bản, ảnh, bài hát). Thư mục như ngăn kéo tủ dùng để gom các tệp cùng loại lại.',
          details: 'Mỗi tệp có Tên tệp và Phần mở rộng (ví dụ: BaiTapToan.docx, AnhLop5A.png). Thư mục có biểu tượng hình chiếc kẹp giấy màu vàng và có thể chứa nhiều tệp cũng như các thư mục con khác.',
          keyMemory: 'Tệp = Tài liệu cụ thể | Thư mục = Ngăn kéo chứa tài liệu!',
          imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-52-2',
          title: '2. Cấu trúc Cây thư mục (Folder Tree)',
          summary: 'Thư mục được tổ chức theo hình cành cây: Thư mục mẹ chứa các thư mục con, thư mục con lại chứa tệp hoặc thư mục con nhỏ hơn.',
          details: 'Ví dụ: Ổ đĩa D: -> Thư mục "HOC TAP" -> Thư mục "LOP 5" -> Các thư mục con "TOAN", "TIENG VIET", "TIN HOC". Cách sắp xếp này giúp chúng ta tìm kiếm tài liệu trong vài giây!',
          keyMemory: 'Cây thư mục giúp sắp xếp thông tin ngăn nắp, dễ tìm kiếm!',
          imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-52-3',
          title: '3. Quy tắc đặt tên tệp và thư mục khoa học',
          summary: 'Nên đặt tên ngắn gọn, có nghĩa, không dấu hoặc có dấu rõ ràng, tránh các ký tự cấm: \\ / : * ? " < > |.',
          details: 'Nên đặt theo cấu trúc: [Tên môn]_[Tên bài]_[Ngày]. Ví dụ: TinHoc_Bai2_CayThuMuc.pptx thay vì đặt tên tùy tiện như "111111.docx" hay "asdasd.png".',
          keyMemory: 'Đặt tên gợi nhớ + Xếp đúng thư mục = Học tập thông minh!',
          imageUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be837a27?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },

    section3MindMap: {
      rootTitle: 'CÂY THƯ MỤC LỚP 5',
      externalMindMapUrl: 'https://coggle.it/diagram/Z5_folders_demo/t/cay-thu-muc-du-lieu',
      externalMindMapTitle: 'Sơ đồ tư duy Coggle: Tổ chức Cây thư mục khoa học',
      allowEmbed: true,
      branches: [
        {
          id: 'b5-f',
          title: '📁 Thư mục Gốc (HỌC TẬP LỚP 5)',
          color: '#F59E0B',
          externalLink: 'https://coggle.it',
          children: [
            {
              id: 'b5-f1',
              title: '📂 Thư mục TOÁN',
              details: 'Chứa: DeThiGiuaKy.pdf, BangCuuChuong.xlsx',
            },
            {
              id: 'b5-f2',
              title: '📂 Thư mục TIN HỌC',
              details: 'Chứa: Scratch_DuAn1.sb3, SoDoTuDuy.png',
            },
            {
              id: 'b5-f3',
              title: '📂 Thư mục TIẾNG ANH',
              details: 'Chứa: Listening_Unit1.mp3, Vocab.docx',
            },
          ],
        },
        {
          id: 'b5-rules',
          title: '⭐ Lợi ích của việc sắp xếp khoa học',
          color: '#3B82F6',
          children: [
            { id: 'b5-r1', title: 'Tìm kiếm cực nhanh', details: 'Chỉ mất 5 giây là mở được bài tập' },
            { id: 'b5-r2', title: 'Không bị thất lạc tệp', details: 'Dữ liệu được bảo vệ an toàn' },
            { id: 'b5-r3', title: 'Dễ dàng chia sẻ với thầy cô', details: 'Nộp bài đúng hạn, chuẩn xác' },
          ],
        },
      ],
    },

    section4Simulation: {
      simulations: [
        {
          id: 'sim-folder-explorer',
          title: 'Mô phỏng Trình khám phá Thư mục & Tệp tin',
          type: 'built_in_folders',
          instructions: 'Hãy thực hành: 1. Tạo thư mục mới "Tin Học 5"; 2. Đổi tên thư mục; 3. Kéo tệp bài tập vào đúng thư mục môn học!',
        },
      ],
    },

    section5Games: {
      gameType: 'matching',
      questions: [
        {
          id: 'q52-1',
          question: 'Biểu tượng của Thư mục (Folder) trên hệ điều hành Windows thường có màu gì?',
          type: 'multiple_choice',
          options: ['A. Màu đỏ', 'B. Màu xanh lá cây', 'C. Màu vàng bìa kẹp', 'D. Màu tím'],
          correctAnswer: 2,
          explanation: 'Thư mục có biểu tượng màu vàng hình kẹp hồ sơ để dễ nhận biết.',
        },
        {
          id: 'q52-2',
          question: 'Trong các tên tệp sau đây, tên nào KHÔNG HỢP LỆ vì chứa ký tự đặc biệt bị cấm?',
          type: 'multiple_choice',
          options: ['A. BaiTapToan_Lop5.docx', 'B. Anh?KyNiem.png', 'C. TinHoc5_Bai2.pptx', 'D. BaiHatTiengAnh.mp3'],
          correctAnswer: 1,
          explanation: 'Ký tự dấu chấm hỏi (?) là một trong những ký tự bị hệ điều hành cấm dùng trong tên tệp.',
        },
        {
          id: 'q52-3',
          question: 'Theo em, cách nào sau đây giúp tìm kiếm bài thuyết trình PowerPoint nhanh nhất?',
          type: 'multiple_choice',
          options: [
            'A. Lưu bừa bãi mọi tệp ra màn hình nền',
            'B. Mở từng thư mục bất kỳ để tìm may rủi',
            'C. Lưu vào thư mục môn học tương ứng và đặt tên rõ ràng',
            'D. Xóa hết các tệp khác để còn lại một tệp',
          ],
          correctAnswer: 2,
          explanation: 'Tạo thư mục theo từng môn học và đặt tên rõ ràng giúp em mở tệp ngay lập tức.',
        },
        {
          id: 'q52-4',
          question: 'Thư mục con là gì?',
          type: 'multiple_choice',
          options: [
            'A. Là một tệp văn bản nhỏ xíu',
            'B. Là thư mục nằm bên trong một thư mục khác',
            'C. Là màn hình máy tính',
            'D. Là nút tắt nguồn máy tính',
          ],
          correctAnswer: 1,
          explanation: 'Thư mục con là thư mục được tạo ra bên trong một thư mục mẹ.',
        },
      ],
    },

    section6AIConfig: {
      enabled: true,
      difficulty: 'advanced',
      keyTakeaways: [
        'Tệp (File) lưu trữ nội dung cụ thể; Thư mục (Folder) phân loại và chứa tệp.',
        'Cây thư mục tổ chức theo cấp bậc giúp quản lý khoa học.',
        'Đặt tên gợi nhớ, không chứa ký tự cấm: \\ / : * ? " < > |.',
      ],
      starterPrompts: [
        'Robot ơi, tại sao máy tính lại không cho đặt dấu hỏi chấm (?) vào tên tệp?',
        'Làm thế nào để dọn dẹp màn hình máy tính đang bị bừa bộn?',
        'Hãy đóng vai thầy giáo đố em về đường dẫn tệp nhé!',
      ],
      sampleDialogues: [
        {
          user: 'Tại sao dấu ? lại bị cấm trong tên tệp hả Robot?',
          robot: '🤖 Câu hỏi cực kỳ sâu sắc của một học sinh Lớp 5! Dấu hỏi chấm (?) và dấu sao (*) trong máy tính là "ký tự đại diện" dùng cho việc tìm kiếm. Nếu máy tính cho phép đặt tên có dấu ?, khi em tìm kiếm tệp, máy tính sẽ bị nhầm lẫn giữa tên tệp và câu lệnh tìm kiếm! Thú vị chưa nào? 💡',
        },
      ],
    },
  },

  // ==========================================
  // LỚP 5 - BÀI 10: LÀM QUEN VỚI LẬP TRÌNH SCRATCH
  // ==========================================
  {
    id: 'lesson-lop5-bai10',
    grade: 5,
    topicId: 'top-5-f',
    order: 2,
    title: 'Bài 10: Làm quen với Scratch - Điều khiển chú mèo di chuyển',
    subtitle: 'Khám phá thế giới sáng tạo với khối lệnh lập trình trực quan',
    description: 'Học sinh làm quen với giao diện Scratch, nhân vật chú mèo Scratch, sân khấu, khu vực lệnh và ghép các khối lệnh di chuyển, xoay người.',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    isPublished: true,
    isDemo: true,
    objectives: [
      'Nhận biết giao diện chính của Scratch: Sân khấu (Stage), Nhân vật (Sprite), Khu vực khối lệnh (Blocks).',
      'Biết cách kéo thả khối lệnh [di chuyển 10 bước], [quay phải 15 độ].',
      'Biết cách gắn cờ xanh [Khi bấm vào lá cờ xanh] để bắt đầu chương trình.',
      'Sáng tạo ra chuyển động đầu tiên cho chú Mèo Vàng.',
    ],

    section1WarmUp: {
      storyOrQuestion: 'Các bạn nhỏ ơi! Bạn Mèo Vàng Scratch đang đứng yên trên sân khấu. Bạn ấy bảo: "Mình muốn nhảy múa và chào các bạn nhỏ Việt Nam, nhưng mình cần các bạn lập trình viên nhí viết kịch bản lệnh cho mình đấy!" Em có muốn trở thành đạo diễn lập trình cho chú Mèo không?',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      riddleQuestion: 'Đố em: "Biểu tượng nào trong Scratch khi nhấn vào sẽ ra lệnh cho toàn bộ kịch bản bắt đầu chạy?"',
      riddleAnswer: 'Đáp án: Biểu tượng Lá Cờ Xanh (Green Flag)!',
      riddleHint: 'Màu xanh lá cây tượng trưng cho sự bắt đầu xuất phát!',
    },

    section2Knowledge: {
      cards: [
        {
          id: 'card-510-1',
          title: '1. Giao diện Scratch có gì đặc biệt?',
          summary: 'Scratch là môi trường lập trình kéo thả hình khối rực rỡ, giúp các em sáng tạo trò chơi và hoạt hình mà không cần gõ mã lệnh phức tạp.',
          details: 'Gồm 3 khu vực chính: 1. Khu vực khối lệnh (bên trái); 2. Khu vực kịch bản (ở giữa - nơi em ghép các mảnh ghép lego); 3. Sân khấu hiển thị nhân vật (bên phải).',
          keyMemory: 'Scratch = Ghép lego khối lệnh để tạo hoạt hình và game!',
          imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-510-2',
          title: '2. Khối lệnh Chuyển động (Motion)',
          summary: 'Các khối lệnh màu xanh dương điều khiển nhân vật bước đi, quay đầu, lướt tới tọa độ mới.',
          details: 'Ví dụ: Khối [di chuyển 10 bước] làm chú mèo tiến lên phía trước. Khối [nếu tiếp xúc với cạnh, bật lại] giúp chú mèo không bị chạy biến mất khỏi màn hình!',
          keyMemory: 'Khối màu Xanh Dương = Chuyển động (Đi, chạy, nhảy, xoay)!',
          imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
        },
        {
          id: 'card-510-3',
          title: '3. Khối lệnh Sự kiện (Events) - Lá cờ xanh',
          summary: 'Khối lệnh màu vàng [khi bấm vào cờ xanh] là khối mở đầu cho mọi kịch bản.',
          details: 'Giống như hiệu lệnh xuất phát của trọng tài, khi người dùng bấm vào lá cờ xanh trên sân khấu, tất cả các khối lệnh gắn bên dưới sẽ lần lượt thực hiện theo thứ tự từ trên xuống dưới.',
          keyMemory: 'Lá Cờ Xanh = Nút Bắt Đầu câu chuyện!',
          imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },

    section3MindMap: {
      rootTitle: 'LẬP TRÌNH SCRATCH 5',
      rootSubtitle: 'Điều khiển nhân vật cơ bản',
      branches: [
        {
          id: 'b-sc-1',
          title: '🟡 Khối Sự kiện (Events)',
          color: '#EAB308',
          children: [
            { id: 'b-sc-11', title: 'Khi bấm vào cờ xanh', details: 'Bắt đầu chương trình chạy' },
            { id: 'b-sc-12', title: 'Khi bấm vào phím cách / mũi tên', details: 'Nhận lệnh điều khiển từ bàn phím' },
          ],
        },
        {
          id: 'b-sc-2',
          title: '🔵 Khối Chuyển động (Motion)',
          color: '#3B82F6',
          children: [
            { id: 'b-sc-21', title: 'Di chuyển 10 bước', details: 'Tiến về phía trước' },
            { id: 'b-sc-22', title: 'Xoay phải 90 độ', details: 'Đổi hướng nhìn của nhân vật' },
            { id: 'b-sc-23', title: 'Nếu chạm cạnh, bật lại', details: 'Giữ nhân vật trong sân khấu' },
          ],
        },
        {
          id: 'b-sc-3',
          title: '🟣 Khối Hiển thị (Looks)',
          color: '#A855F7',
          children: [
            { id: 'b-sc-31', title: 'Nói "Xin chào!" trong 2 giây', details: 'Hiện bóng thoại trên đầu nhân vật' },
            { id: 'b-sc-32', title: 'Sang trang phục kế tiếp', details: 'Tạo hoạt ảnh bước chân chuyển động' },
          ],
        },
      ],
    },

    section4Simulation: {
      simulations: [
        {
          id: 'sim-scratch-mini',
          title: 'Mô phỏng sân chơi Scratch Mini - Điều khiển Mèo Vàng',
          type: 'built_in_scratch',
          instructions: 'Kéo các thẻ lệnh: [Bước tới], [Quay phải], [Nói "Xin chào!"], [Đổi màu]. Sau đó nhấn nút CỜ XANH để xem chú mèo biểu diễn nhé!',
        },
      ],
    },

    section5Games: {
      gameType: 'quiz',
      questions: [
        {
          id: 'q510-1',
          question: 'Biểu tượng nào dùng để bắt đầu chạy chương trình Scratch?',
          type: 'multiple_choice',
          options: ['A. Nút chấm đỏ', 'B. Lá cờ xanh', 'C. Nút tạm dừng', 'D. Nút thùng rác'],
          correctAnswer: 1,
          explanation: 'Lá cờ xanh (Green flag) kích hoạt khối sự kiện [Khi bấm vào lá cờ xanh] để chương trình chạy.',
        },
        {
          id: 'q510-2',
          question: 'Khối lệnh [di chuyển 10 bước] thuộc nhóm lệnh có màu gì?',
          type: 'multiple_choice',
          options: ['A. Màu vàng (Sự kiện)', 'B. Màu tím (Hiển thị)', 'C. Màu xanh dương (Chuyển động)', 'D. Màu xanh lá (Các phép toán)'],
          correctAnswer: 2,
          explanation: 'Nhóm lệnh Chuyển động (Motion) có màu xanh dương đặc trưng.',
        },
        {
          id: 'q510-3',
          question: 'Nếu muốn chú mèo nói câu "Chào bạn!", em dùng khối lệnh nào?',
          type: 'multiple_choice',
          options: ['A. Khối [di chuyển 10 bước]', 'B. Khối [nói "Chào bạn!"]', 'C. Khối [quay 15 độ]', 'D. Khối [bật lại nếu chạm cạnh]'],
          correctAnswer: 1,
          explanation: 'Khối [nói ...] thuộc nhóm Hiển thị (Looks) sẽ tạo bong bóng thoại trên đầu nhân vật.',
        },
        {
          id: 'q510-4',
          question: 'Lợi ích lớn nhất của việc học lập trình Scratch đối với học sinh là gì?',
          type: 'multiple_choice',
          options: [
            'A. Rèn luyện tư duy logic, tính sáng tạo và khả năng giải quyết vấn đề',
            'B. Để chơi game cả ngày không cần học bài khác',
            'C. Để tháo rời các linh kiện máy tính',
            'D. Để gõ bàn phím thật mạnh',
          ],
          correctAnswer: 0,
          explanation: 'Scratch giúp các em học sinh rèn luyện tư duy thuật toán và sáng tạo nên các sản phẩm số hữu ích.',
        },
      ],
    },

    section6AIConfig: {
      enabled: true,
      difficulty: 'advanced',
      keyTakeaways: [
        'Scratch là ngôn ngữ lập trình trực quan kéo thả.',
        'Sân khấu là nơi nhân vật biểu diễn hành động.',
        'Khối lệnh màu xanh dương điều khiển chuyển động, màu vàng bắt đầu sự kiện.',
      ],
      starterPrompts: [
        'Robot ơi, làm sao để chú mèo Scratch đi lùi lại?',
        'Làm cách nào để chú mèo đổi màu lông liên tục?',
        'Robot hãy đố em một thuật toán đơn giản trong Scratch nhé!',
      ],
      sampleDialogues: [
        {
          user: 'Làm sao để chú mèo Scratch đi lùi hả Robot?',
          robot: '🤖 Ồ một bí mật cực hay! Để chú mèo đi lùi, em chỉ cần đổi số trong khối lệnh [di chuyển 10 bước] thành số âm: [di chuyển -10 bước]! Khi đó chú mèo sẽ bước giật lùi như đang nhảy điệu nhảy Moonwalk nổi tiếng đấy! Em thử ngay xem nhé! 🐱✨',
        },
      ],
    },
  },
];
