// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    const ctService = strapi.plugin('content-manager').service('content-types');
    const compService = strapi.plugin('content-manager').service('components');

    const updateMeta = async (service, uid, updates) => {
      try {
        const config = await service.findConfiguration({ uid });
        if (config && config.metadatas) {
          let changed = false;
          for (const [field, desc] of Object.entries(updates)) {
            if (config.metadatas[field] && config.metadatas[field].edit) {
              if (config.metadatas[field].edit.description !== desc) {
                config.metadatas[field].edit.description = desc;
                changed = true;
              }
            }
          }
          if (changed) {
            await service.updateConfiguration({ uid }, config);
          }
        }
      } catch (err) {
        console.error('Error updating config for', uid, err);
      }
    };

    // Update Project
    await updateMeta(ctService, 'api::project.project', {
      title: 'Hero Section - Tên chính của dự án. (VD: Global E-commerce Campaign)',
      slug: 'Đường dẫn URL của dự án.',
      category: 'Danh mục dự án để phân loại trên web.',
      description: 'Mô tả chung (không hiển thị trên giao diện chính, dùng cho SEO).',
      link: 'Đường dẫn tham khảo (nếu có).',
      eyebrow: 'Hero Section - Tiêu đề phụ nằm trên cùng (VD: Performance Marketing · 2024).',
      summary: 'Hero Section - Tóm tắt ngắn gọn dự án (1-3 câu).',
      image: 'Ảnh Thumbnail hiển thị ngoài trang chủ (Danh sách dự án). Khuyến nghị tỉ lệ 16:9 (1280x720px), dưới 500KB.',
      spanClass: 'Kích thước thẻ hiển thị ngoài trang chủ.',
      metric: 'Chỉ số hiển thị trên Thumbnail trang chủ (VD: +200%).',
      metricLabel: 'Nhãn cho chỉ số Thumbnail (VD: ROI).',
      overview: 'Section 2 (Project Overview): Thường thêm 3 thẻ để hiển thị đẹp nhất trên web.',
      metrics: 'Section 3 (Key Metrics): Hiển thị dạng vòng tròn (rings).',
      phases: 'Section 4 (Strategy & Execution): Hiển thị đan xen (zíc-zắc) ảnh và chữ.',
      assets: 'Section 5 (Creative Assets): Khu vực lưới Bento (dọc & vuông).'
    });

    // Update Components
    await updateMeta(compService, 'project.overview-item', {
      k: 'Số thứ tự hoặc nhãn nhỏ nằm trên tiêu đề thẻ (VD: 01, Bước 1).',
      title: 'Tiêu đề của thẻ (VD: Challenge, Solution, Results).',
      body: 'Mô tả chi tiết, khuyến nghị 3-4 dòng.'
    });

    await updateMeta(compService, 'project.metric', {
      prefix: 'Ký tự đặt trước con số (VD: +, $).',
      count: 'Giá trị số để chạy hiệu ứng đếm (VD: 200, 10). Chỉ nhập số.',
      suffix: 'Ký tự theo sau con số (VD: %, k+, M+).',
      label: 'Tên của chỉ số nằm dưới vòng tròn (VD: ROI, Leads).',
      ring: 'Mức độ lấp đầy vòng tròn (từ 1 đến 100).'
    });

    await updateMeta(compService, 'project.phase', {
      step: 'Nhãn hiển thị tiến trình (VD: Phase 01).',
      title: 'Tiêu đề Giai đoạn.',
      body: 'Nội dung chi tiết. Có thể dùng Bold để nhấn mạnh.',
      image: 'Ảnh minh họa. Tỉ lệ 4:3 hoặc 16:9 (VD: 800x600px).'
    });

    await updateMeta(compService, 'project.creative-asset', {
      category: 'Phân loại tài nguyên (VD: Social, Web, Video).',
      name: 'Tiêu đề ảnh.',
      description: 'Đoạn chữ hiện ra khi di chuột vào (Hover).',
      size: 'Chọn "tall" (để up ảnh dọc 3:4/9:16) hoặc "normal" (ảnh vuông 1:1).',
      image: 'Hình ảnh ứng với Size. (Dọc: ~900x1200px, Vuông: ~800x800px).'
    });
  },
};
