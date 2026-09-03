import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";


/* ==========================================================
   REUSABLE SCHEMAS
========================================================== */


/* ----------------------------------------------------------
   ORIGINAL DATE / ERA
---------------------------------------------------------- */

const originalDateDetails = z.object({

  year:
    z.number().int().optional(),

  month:
    z.enum([
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ]).optional(),

  day:
    z.number()
      .int()
      .min(1)
      .max(31)
      .optional(),

  season:
    z.enum([
      "spring",
      "summer",
      "autumn",
      "winter",
      "spring/summer",
      "fall/winter",
    ]).optional(),

  timeOfDay:
    z.enum([
      "early morning",
      "morning",
      "late morning",
      "afternoon",
      "late afternoon",
      "evening",
      "night",
      "late night",
    ]).optional(),

  qualifier:
    z.enum([
      "exact",
      "circa",
      "before",
      "after",
      "early",
      "mid",
      "late",
      "range",
      "unknown",
    ]).optional(),

  endYear:
    z.number().int().optional(),

  eraLabel:
    z.string().optional(),

  dateNote:
    z.string().optional(),

});


/* ----------------------------------------------------------
   CREATOR
---------------------------------------------------------- */

const creator = z.object({

  name:
    z.string(),

  role:
    z.string().optional(),

});


/* ----------------------------------------------------------
   ADDITIONAL MEDIA
---------------------------------------------------------- */

const additionalMediaItem = z.object({

  mediaType:
    z.enum([
      "image",
      "loop",
      "video",
      "audio",
      "document",
    ]),

  file:
    z.string(),

  caption:
    z.string().optional(),

  credit:
    z.string().optional(),

  sourceUrl:
    z.string().optional(),

});


/* ----------------------------------------------------------
   PRIMARY SOURCE
---------------------------------------------------------- */

const primarySource = z.object({

  type:
    z.string().optional(),

  name:
    z.string().optional(),

  url:
    z.string().optional(),

});


/* ----------------------------------------------------------
   DISCOVERY
---------------------------------------------------------- */

const discovery = z.object({

  type:
    z.string().optional(),

  name:
    z.string().optional(),

  url:
    z.string().optional(),

});



/* ==========================================================
   ARCHIVE
========================================================== */

const archive = defineCollection({

  loader: glob({
    base: "./src/content/archive",
    pattern: "**/*.md",
  }),

  schema: z.object({


    /* ======================================================
       SYSTEM
    ====================================================== */

    archiveNumber:
      z.string().optional(),



    /* ======================================================
       IDENTITY
    ====================================================== */

    title:
      z.string(),

    /*
      Exact date Ping found/saved the item.
    */
    dateFound:
      z.coerce.date(),

    /*
      Flexible date system for the original work.
    */
    originalDateDetails:
      originalDateDetails.optional(),

    creators:
      z.array(creator).default([]),



    /* ======================================================
       WRITING
    ====================================================== */

    archiveDescription:
      z.string().optional(),

    reason:
      z.string().optional(),



    /* ======================================================
       CLASSIFICATION
    ====================================================== */

    primaryObjectType:
      z.string().optional(),

    secondaryObjectTypes:
      z.array(
        z.string()
      ).default([]),

    mediums:
      z.array(
        z.string()
      ).default([]),

    themes:
      z.array(
        z.string()
      ).default([]),



    /* ======================================================
       COLORS
    ====================================================== */

    colors:
      z.array(
        z.string()
      ).default([]),

    colorNotes:
      z.string().optional(),



    /* ======================================================
       SERIES / PROJECT
    ====================================================== */

    seriesProject:
      z.string().optional(),

    bodyOfWork:
      z.string().optional(),



    /* ======================================================
       LOCATION
    ====================================================== */

    locations:
      z.array(
        z.string()
      ).default([]),



    /* ======================================================
       COVER MEDIA
    ====================================================== */

    coverType:
      z.enum([
        "image",
        "loop",
        "video",
        "audio",
      ]).default("image"),

    /*
      Internal field remains "image" even though
      Pages CMS labels it Cover Media.
    */
    image:
      z.string(),

    videoPoster:
      z.string().optional(),

    alt:
      z.string().optional(),



    /* ======================================================
       ADDITIONAL MEDIA
    ====================================================== */

    additionalMedia:
      z.array(
        additionalMediaItem
      ).default([]),



    /* ======================================================
       PROVENANCE
    ====================================================== */

    primarySource:
      primarySource.optional(),

    discovery:
      discovery.optional(),



    /* ======================================================
       WEBSITE
    ====================================================== */

    featured:
      z.boolean().default(false),

    private:
      z.boolean().default(false),



    /* ======================================================
       TEMPORARY OLD FIELDS

       These are NOT part of the new CMS form.

       They exist only so your current public pages and your
       not-yet-reedited findings continue working during the
       transition.

       We will remove this entire section later.
    ====================================================== */

    originalDate:
      z.string().optional(),

    creator:
      z.string().optional(),

    kind:
      z.string().optional(),

    location:
      z.string().optional(),

    country:
      z.string().optional(),

    region:
      z.string().optional(),

    city:
      z.string().optional(),

    neighborhood:
      z.string().optional(),

    venue:
      z.string().optional(),

    collections:
      z.array(
        z.string()
      ).default([]),

    tags:
      z.array(
        z.string()
      ).default([]),

    favorite:
      z.boolean().default(false),

    sourceName:
      z.string().optional(),

    sourceUrl:
      z.string().optional(),

    gallery:
      z.array(
        z.object({

          image:
            z.string(),

          caption:
            z.string().optional(),

          credit:
            z.string().optional(),

          sourceUrl:
            z.string().optional(),

        })
      ).default([]),

    attachments:
      z.array(
        z.object({

          file:
            z.string(),

          title:
            z.string(),

        })
      ).default([]),

  }),

});



/* ==========================================================
   NOTES
========================================================== */

const notes = defineCollection({

  loader: glob({
    base: "./src/content/notes",
    pattern: "**/*.md",
  }),

  schema: z.object({

    noteNumber:
      z.string().optional(),

    type:
      z.enum([
        "essay",
        "note",
        "quote",
        "fragment",
        "journal",
        "research",
        "draft",
      ]).optional(),

    date:
      z.coerce.date(),

    title:
      z.string().optional(),

    subtitle:
      z.string().optional(),

    topics:
      z.array(
        z.string()
      ).default([]),

    people:
      z.array(
        z.string()
      ).default([]),

    worksReferenced:
      z.array(
        z.string()
      ).default([]),

    places:
      z.array(
        z.string()
      ).default([]),

    quoteAuthor:
      z.string().optional(),

    quoteSource:
      z.string().optional(),

    quoteUrl:
      z.string().optional(),

    references:
      z.array(
        z.string()
      ).default([]),

    private:
      z.boolean().default(false),

    author:
      z.string().optional(),

    sourceName:
      z.string().optional(),

    sourceUrl:
      z.string().optional(),

    image:
      z.string().optional(),

    location:
      z.string().optional(),

    tags:
      z.array(
        z.string()
      ).default([]),

    featured:
      z.boolean().default(false),

    summary:
      z.string().optional(),

  }),

});



/* ==========================================================
   EXPORT
========================================================== */

export const collections = {

  archive,

  notes,

};