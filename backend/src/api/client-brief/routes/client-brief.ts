export default {
  routes: [
    {
      method: 'POST',
      path: '/client-briefs',
      handler: 'client-brief.submit',
      config: { auth: false },
    },
  ],
};
