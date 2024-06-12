import mongoose from 'mongoose';
import User from './User.js';
const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    disabledEditing: { type: Boolean, default: false },
    // profileActive: { type: Boolean, default: true },
    visible: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    visitCount: { type: Number, default: 0 },
    group: {
      type: mongoose.Schema.ObjectId,
      ref: 'Group',
    },
    card: {
      cardId: { type: String },
      cardWrited: { type: Number, default: 0 },
      theme: {
        type: String,
        enum: [
          'gold&black',
          'white&black',
          'violet&green',
          'orange&black',
          'aero&black',
          'white&blue',
          'blue&black',
          'restaturants',
        ],
        default: 'orange&black',
      },
    },
    profile: {
      name: { type: String },
      designation: { type: String },
      companyName: { type: String },
      bio: { type: String },
      profileLink: { type: String },
      profilePicture: Object,
      profileBanner: Object,
      profileQR: Object,
    },
    contact: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Contacts' }, // New field for editable heading

      contacts: {
        type: [
          {
            label: {
              type: String,
            },
            value: {
              type: String,
            },
            street: {
              type: String,
            },
            pincode: {
              type: String,
            },
            type: {
              type: String,
              enum: [
                'phone',
                'email',
                'social',
                'whatsapp',
                'wabusiness',
                'location',
              ],
            },
          },
        ],
        default: [
          {
            label: 'Phone',
            value: '',
            type: 'phone',
          },
          {
            label: 'Email',
            value: '',
            type: 'email',
          },
          {
            label: 'Whatsapp',
            value: '',
            type: 'wabusiness',
          },
          {
            label: 'Address',
            street: '',
            pincode: '',
            value: '',
            type: 'location',
          },
          {
            label: 'Whatsapp',
            value: '',
            type: 'whatsapp',
          },
        ],
      },
    },
    social: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Social Media' }, // New field for editable heading
      socials: {
        type: [
          {
            label: String,
            value: String,
            type: {
              type: String,
              enum: [
                'instagram',
                'linkedin',
                'twitter',
                'facebook',
                'youtube',
                'spotify',
                'medium',
                'dribble',
                'behance',
                'github',
                'google',
                'other',
              ],
            },
          },
        ],
        default: [
          {
            label: 'Instagram ID',
            value: '',
            type: 'instagram',
          },
          {
            label: 'Linkedin Profile',
            value: '',
            type: 'linkedin',
          },
          {
            label: 'Twitter',
            value: '',
            type: 'twitter',
          },
          {
            label: 'Facebook',
            value: '',
            type: 'facebook',
          },
        ],
      },
    },
    website: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Website' }, // New field for editable heading

      websites: { type: [{ link: String, name: String }], default: [] },
    },
    service: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Services' }, // New field for editable heading

      services: {
        type: [
          {
            label: String,
            image: Object,
            value: String,
            description: String,
          },
        ],
        default: [],
      },
    },
    document: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Files' }, // New field for editable heading

      documents: {
        type: [
          {
            label: String,
            image: Object,
            value: String,
          },
        ],
        default: [],
      },
    },
    video: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Video Link' }, // New field for editable heading

      videos: { type: [{ link: String }], default: [] },
    },
    product: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Products' }, // New field for editable heading

      products: {
        type: [
          {
            name: String,
            link: String,
            description: String,
            image: Object,
            price: Number,
            offerPrice: Number,
            category: String,
          },
        ],
        default: [],
      },
    },

    category: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Category' }, // New field for editable heading

      categorys: { type: [{ name: String }], default: [] },
    },
    award: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Awards' }, // New field for editable heading
      awards: {
        type: [
          {
            label: String,
            image: Object,
            value: String,
          },
        ],
        default: [],
      },
    },

    certificate: {
      status: { type: Boolean, default: false },
      label: { type: String, default: 'Certificates' }, // New field for editable heading

      certificates: {
        type: [
          {
            label: String,
            image: Object,
            value: String,
          },
        ],
        default: [],
      },
    },
    form: {
      status: { type: Number, default: 0 },
      forms: {
        type: [
          {
            name: String,
            phone: String,
            email: String,
            message: String,
            createdAt: { type: Date, default: Date.now },
          },
        ],
        default: [],
      },
    },
    bank: {
      status: { type: Boolean, default: false },
      bankDetails: {
        type: {
          _id: {
            type: mongoose.Schema.ObjectId,
            default: new mongoose.Types.ObjectId(),
          },
          name: String,
          accnumber: String,
          bank: String,
          branch: String,
          ifsc: String,
          swift: String,
          vat: String,
        },
        default: {
          name: '',
        },
      },
    },
    enquiry: {
      status: { type: Boolean, default: false },
      email: {
        email: { type: String, default: '' },
        _id: {
          type: mongoose.Schema.ObjectId,
          default: new mongoose.Types.ObjectId(),
        },
      },
    },
  },
  { timestamps: true }
);

ProfileSchema.pre('save', async function (next) {
  const profile = this;
  const user = await profile.populate('user');
  if (user?.user?.role === 'admin') {
    const fieldsToRemove = [
      'card',
      'profile.designation',
      'profile.profileLink',
      'profile.profileQR',
      'bank',
      'certificate',
      'award',
      'video',
      'service',
      'website',
      'category',
      'social',
      'product',
      'visible',
      'enquiry',
    ];
    // Iterate over the array and remove each field from the document
    for (const field of fieldsToRemove) {
      this[field] = undefined;
    }
  }
  next();
});

export default mongoose.model('Profile', ProfileSchema);
