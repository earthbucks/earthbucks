export declare const appRouter: import("@trpc/server").CreateRouterInner<
  import("@trpc/server").RootConfig<{
    ctx: {
      req: import("fastify").FastifyRequest<
        import("fastify").RouteGenericInterface,
        import("fastify").RawServerDefault,
        import("http").IncomingMessage,
        import("fastify").FastifySchema,
        import("fastify").FastifyTypeProviderDefault,
        unknown,
        import("fastify").FastifyBaseLogger,
        import("fastify/types/type-provider.js").ResolveFastifyRequestType<
          import("fastify").FastifyTypeProviderDefault,
          import("fastify").FastifySchema,
          import("fastify").RouteGenericInterface
        >
      >;
      res: import("fastify").FastifyReply<
        import("fastify").RawServerDefault,
        import("http").IncomingMessage,
        import("http").ServerResponse<import("http").IncomingMessage>,
        import("fastify").RouteGenericInterface,
        unknown,
        import("fastify").FastifySchema,
        import("fastify").FastifyTypeProviderDefault,
        unknown
      >;
      pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
      user: {
        id: number;
        pubKey: Buffer;
        createdAt: Date;
        name: string | null;
        avatarId: string | null;
        nSwipes: number;
      } | null;
      completeUserProfile: {
        id: number;
        name: string;
        avatarId: string;
        nSwipes: number;
        pubKeyStr: string;
      } | null;
      sessionTokenId: Buffer | null;
    };
    meta: object;
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: import("@trpc/server").DefaultDataTransformer;
  }>,
  {
    auth: import("@trpc/server").CreateRouterInner<
      import("@trpc/server").RootConfig<{
        ctx: {
          req: import("fastify").FastifyRequest<
            import("fastify").RouteGenericInterface,
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown,
            import("fastify").FastifyBaseLogger,
            import("fastify/types/type-provider.js").ResolveFastifyRequestType<
              import("fastify").FastifyTypeProviderDefault,
              import("fastify").FastifySchema,
              import("fastify").RouteGenericInterface
            >
          >;
          res: import("fastify").FastifyReply<
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("http").ServerResponse<import("http").IncomingMessage>,
            import("fastify").RouteGenericInterface,
            unknown,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown
          >;
          pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
          user: {
            id: number;
            pubKey: Buffer;
            createdAt: Date;
            name: string | null;
            avatarId: string | null;
            nSwipes: number;
          } | null;
          completeUserProfile: {
            id: number;
            name: string;
            avatarId: string;
            nSwipes: number;
            pubKeyStr: string;
          } | null;
          sessionTokenId: Buffer | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
      }>,
      {
        getSigninChallenge: import("@trpc/server").BuildProcedure<
          "query",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
              sessionTokenId: Buffer | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: import("@earthbucks/lib/dist/signin-challenge.js").SigninChallenge;
            _output_out: string;
          },
          unknown
        >;
        postSigninResponse: import("@trpc/server").BuildProcedure<
          "mutation",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
              sessionTokenId: Buffer | null;
            };
            _input_in: string;
            _input_out: import("@earthbucks/lib/dist/signin-response.js").SigninResponse;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          string
        >;
        signout: import("@trpc/server").BuildProcedure<
          "mutation",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _ctx_out: {
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
              sessionTokenId: Buffer | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
            _meta: object;
          },
          void
        >;
      }
    >;
    blockMessage: import("@trpc/server").CreateRouterInner<
      import("@trpc/server").RootConfig<{
        ctx: {
          req: import("fastify").FastifyRequest<
            import("fastify").RouteGenericInterface,
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown,
            import("fastify").FastifyBaseLogger,
            import("fastify/types/type-provider.js").ResolveFastifyRequestType<
              import("fastify").FastifyTypeProviderDefault,
              import("fastify").FastifySchema,
              import("fastify").RouteGenericInterface
            >
          >;
          res: import("fastify").FastifyReply<
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("http").ServerResponse<import("http").IncomingMessage>,
            import("fastify").RouteGenericInterface,
            unknown,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown
          >;
          pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
          user: {
            id: number;
            pubKey: Buffer;
            createdAt: Date;
            name: string | null;
            avatarId: string | null;
            nSwipes: number;
          } | null;
          completeUserProfile: {
            id: number;
            name: string;
            avatarId: string;
            nSwipes: number;
            pubKeyStr: string;
          } | null;
          sessionTokenId: Buffer | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
      }>,
      {
        getLatest: import("@trpc/server").BuildProcedure<
          "query",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          | {
              id: null;
              num: null;
            }
          | {
              id: string;
              num: number;
            }
        >;
        postNew: import("@trpc/server").BuildProcedure<
          "mutation",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: {
              message: string;
              blockMessageHeader: string;
            };
            _input_out: {
              message: string;
              blockMessageHeader: import("@earthbucks/lib/dist/block-message-header.js").BlockMessageHeader;
            };
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          void
        >;
      }
    >;
    keys: import("@trpc/server").CreateRouterInner<
      import("@trpc/server").RootConfig<{
        ctx: {
          req: import("fastify").FastifyRequest<
            import("fastify").RouteGenericInterface,
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown,
            import("fastify").FastifyBaseLogger,
            import("fastify/types/type-provider.js").ResolveFastifyRequestType<
              import("fastify").FastifyTypeProviderDefault,
              import("fastify").FastifySchema,
              import("fastify").RouteGenericInterface
            >
          >;
          res: import("fastify").FastifyReply<
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("http").ServerResponse<import("http").IncomingMessage>,
            import("fastify").RouteGenericInterface,
            unknown,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown
          >;
          pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
          user: {
            id: number;
            pubKey: Buffer;
            createdAt: Date;
            name: string | null;
            avatarId: string | null;
            nSwipes: number;
          } | null;
          completeUserProfile: {
            id: number;
            name: string;
            avatarId: string;
            nSwipes: number;
            pubKeyStr: string;
          } | null;
          sessionTokenId: Buffer | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
      }>,
      {
        createNewDerivedKey: import("@trpc/server").BuildProcedure<
          "mutation",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          {
            id: number;
            clientPubKey: string;
            clientDerivationPrivKey: string;
            derivedPubKey: string;
            derivedPkh: string;
            createdAt: Date;
          }
        >;
      }
    >;
    miningButton: import("@trpc/server").CreateRouterInner<
      import("@trpc/server").RootConfig<{
        ctx: {
          req: import("fastify").FastifyRequest<
            import("fastify").RouteGenericInterface,
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown,
            import("fastify").FastifyBaseLogger,
            import("fastify/types/type-provider.js").ResolveFastifyRequestType<
              import("fastify").FastifyTypeProviderDefault,
              import("fastify").FastifySchema,
              import("fastify").RouteGenericInterface
            >
          >;
          res: import("fastify").FastifyReply<
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("http").ServerResponse<import("http").IncomingMessage>,
            import("fastify").RouteGenericInterface,
            unknown,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown
          >;
          pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
          user: {
            id: number;
            pubKey: Buffer;
            createdAt: Date;
            name: string | null;
            avatarId: string | null;
            nSwipes: number;
          } | null;
          completeUserProfile: {
            id: number;
            name: string;
            avatarId: string;
            nSwipes: number;
            pubKeyStr: string;
          } | null;
          sessionTokenId: Buffer | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
      }>,
      {
        getNewWorkPack: import("@trpc/server").BuildProcedure<
          "query",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          {
            shareId: number;
            retryTarget: string;
            shareTarget: string;
            workPack: string;
          }
        >;
        postWorkPack: import("@trpc/server").BuildProcedure<
          "mutation",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: {
              count: number;
              duration: number;
              workPack: string;
              shareId: number;
            };
            _input_out: {
              count: number;
              duration: number;
              workPack: import("@earthbucks/lib/dist/work-pack.js").WorkPack;
              shareId: number;
            };
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          void
        >;
      }
    >;
    userAvatar: import("@trpc/server").CreateRouterInner<
      import("@trpc/server").RootConfig<{
        ctx: {
          req: import("fastify").FastifyRequest<
            import("fastify").RouteGenericInterface,
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown,
            import("fastify").FastifyBaseLogger,
            import("fastify/types/type-provider.js").ResolveFastifyRequestType<
              import("fastify").FastifyTypeProviderDefault,
              import("fastify").FastifySchema,
              import("fastify").RouteGenericInterface
            >
          >;
          res: import("fastify").FastifyReply<
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("http").ServerResponse<import("http").IncomingMessage>,
            import("fastify").RouteGenericInterface,
            unknown,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown
          >;
          pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
          user: {
            id: number;
            pubKey: Buffer;
            createdAt: Date;
            name: string | null;
            avatarId: string | null;
            nSwipes: number;
          } | null;
          completeUserProfile: {
            id: number;
            name: string;
            avatarId: string;
            nSwipes: number;
            pubKeyStr: string;
          } | null;
          sessionTokenId: Buffer | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
      }>,
      {
        uploadAvatar: import("@trpc/server").BuildProcedure<
          "mutation",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: string;
            _input_out: Buffer;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          void
        >;
      }
    >;
    userChallenge: import("@trpc/server").CreateRouterInner<
      import("@trpc/server").RootConfig<{
        ctx: {
          req: import("fastify").FastifyRequest<
            import("fastify").RouteGenericInterface,
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown,
            import("fastify").FastifyBaseLogger,
            import("fastify/types/type-provider.js").ResolveFastifyRequestType<
              import("fastify").FastifyTypeProviderDefault,
              import("fastify").FastifySchema,
              import("fastify").RouteGenericInterface
            >
          >;
          res: import("fastify").FastifyReply<
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("http").ServerResponse<import("http").IncomingMessage>,
            import("fastify").RouteGenericInterface,
            unknown,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown
          >;
          pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
          user: {
            id: number;
            pubKey: Buffer;
            createdAt: Date;
            name: string | null;
            avatarId: string | null;
            nSwipes: number;
          } | null;
          completeUserProfile: {
            id: number;
            name: string;
            avatarId: string;
            nSwipes: number;
            pubKeyStr: string;
          } | null;
          sessionTokenId: Buffer | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
      }>,
      {
        getCompuchaChallenge: import("@trpc/server").BuildProcedure<
          "query",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          string
        >;
        postCompuchaResponse: import("@trpc/server").BuildProcedure<
          "mutation",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: string;
            _input_out: import("@earthbucks/lib/dist/compucha-challenge.js").CompuchaChallenge;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          void
        >;
      }
    >;
    userName: import("@trpc/server").CreateRouterInner<
      import("@trpc/server").RootConfig<{
        ctx: {
          req: import("fastify").FastifyRequest<
            import("fastify").RouteGenericInterface,
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown,
            import("fastify").FastifyBaseLogger,
            import("fastify/types/type-provider.js").ResolveFastifyRequestType<
              import("fastify").FastifyTypeProviderDefault,
              import("fastify").FastifySchema,
              import("fastify").RouteGenericInterface
            >
          >;
          res: import("fastify").FastifyReply<
            import("fastify").RawServerDefault,
            import("http").IncomingMessage,
            import("http").ServerResponse<import("http").IncomingMessage>,
            import("fastify").RouteGenericInterface,
            unknown,
            import("fastify").FastifySchema,
            import("fastify").FastifyTypeProviderDefault,
            unknown
          >;
          pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
          user: {
            id: number;
            pubKey: Buffer;
            createdAt: Date;
            name: string | null;
            avatarId: string | null;
            nSwipes: number;
          } | null;
          completeUserProfile: {
            id: number;
            name: string;
            avatarId: string;
            nSwipes: number;
            pubKeyStr: string;
          } | null;
          sessionTokenId: Buffer | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
      }>,
      {
        isUserNameAvailable: import("@trpc/server").BuildProcedure<
          "query",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: string;
            _input_out: string;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          boolean
        >;
        setUserName: import("@trpc/server").BuildProcedure<
          "mutation",
          {
            _config: import("@trpc/server").RootConfig<{
              ctx: {
                req: import("fastify").FastifyRequest<
                  import("fastify").RouteGenericInterface,
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown,
                  import("fastify").FastifyBaseLogger,
                  import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                    import("fastify").FastifyTypeProviderDefault,
                    import("fastify").FastifySchema,
                    import("fastify").RouteGenericInterface
                  >
                >;
                res: import("fastify").FastifyReply<
                  import("fastify").RawServerDefault,
                  import("http").IncomingMessage,
                  import("http").ServerResponse<import("http").IncomingMessage>,
                  import("fastify").RouteGenericInterface,
                  unknown,
                  import("fastify").FastifySchema,
                  import("fastify").FastifyTypeProviderDefault,
                  unknown
                >;
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                  id: number;
                  pubKey: Buffer;
                  createdAt: Date;
                  name: string | null;
                  avatarId: string | null;
                  nSwipes: number;
                } | null;
                completeUserProfile: {
                  id: number;
                  name: string;
                  avatarId: string;
                  nSwipes: number;
                  pubKeyStr: string;
                } | null;
                sessionTokenId: Buffer | null;
              };
              meta: object;
              errorShape: import("@trpc/server").DefaultErrorShape;
              transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
              pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
              user: {
                id: number;
                pubKey: Buffer;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                nSwipes: number;
              } | null;
              sessionTokenId: Buffer | null;
              res: import("fastify").FastifyReply<
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("http").ServerResponse<import("http").IncomingMessage>,
                import("fastify").RouteGenericInterface,
                unknown,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown
              >;
              req: import("fastify").FastifyRequest<
                import("fastify").RouteGenericInterface,
                import("fastify").RawServerDefault,
                import("http").IncomingMessage,
                import("fastify").FastifySchema,
                import("fastify").FastifyTypeProviderDefault,
                unknown,
                import("fastify").FastifyBaseLogger,
                import("fastify/types/type-provider.js").ResolveFastifyRequestType<
                  import("fastify").FastifyTypeProviderDefault,
                  import("fastify").FastifySchema,
                  import("fastify").RouteGenericInterface
                >
              >;
              completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
              } | null;
            };
            _input_in: string;
            _input_out: string;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          Response | undefined
        >;
      }
    >;
  }
>;
export type AppRouter = typeof appRouter;
