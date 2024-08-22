import { Header } from "@earthbucks/lib";
import { FixedBuf } from "@earthbucks/lib";
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
    };
    meta: object;
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: import("@trpc/server").DefaultDataTransformer;
  }>,
  {
    testQuery: import("@trpc/server").BuildProcedure<
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
        };
        _input_in: typeof import("@trpc/server").unsetMarker;
        _input_out: typeof import("@trpc/server").unsetMarker;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
      },
      string | undefined
    >;
    powValidator: import("@trpc/server").CreateRouterInner<
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
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
      }>,
      {
        getHeader: import("@trpc/server").BuildProcedure<
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
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: Header;
            _output_out: string;
          },
          unknown
        >;
        validateHeaderPow: import("@trpc/server").BuildProcedure<
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
            };
            _input_in: {
              header: string;
              lch10Ids: string[];
            };
            _input_out: {
              header: Header;
              lch10Ids: FixedBuf<32>[];
            };
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
          },
          | {
              result: null;
              error: string;
            }
          | {
              result: boolean;
              error: null;
            }
        >;
      }
    >;
  }
>;
export type AppRouter = typeof appRouter;
